import { createHash, randomBytes } from 'crypto';

import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';

import { ErrorCodes } from 'src/constants';
import { RedisClient, withRedisTimeout } from 'src/redis/client';
import { REDIS_CLIENT } from 'src/redis/redis.module';

import { CaptchaKind, CaptchaPolicyService, RateWindow } from './captcha-policy.service';

// One key per kind/subject/action: works on standalone Redis and Redis Cluster.
// Redis TIME avoids differences between application instance clocks.
export const CAPTCHA_RATE_SCRIPT = `
local time = redis.call('TIME')
local now = tonumber(time[1]) * 1000 + math.floor(tonumber(time[2]) / 1000)
local interval = tonumber(ARGV[1])
local windows = cjson.decode(ARGV[2])
local horizon = interval
for _, w in ipairs(windows) do horizon = math.max(horizon, w.windowS * 1000) end
redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', now - horizon)
local wait = 0
local latest = redis.call('ZREVRANGE', KEYS[1], 0, 0, 'WITHSCORES')
if #latest > 0 then wait = math.max(wait, tonumber(latest[2]) + interval - now) end
for _, w in ipairs(windows) do
  local cutoff = '(' .. tostring(now - w.windowS * 1000)
  if redis.call('ZCOUNT', KEYS[1], cutoff, '+inf') >= w.limit then
    local oldest = redis.call('ZRANGEBYSCORE', KEYS[1], cutoff, '+inf', 'WITHSCORES', 'LIMIT', 0, 1)
    wait = math.max(wait, tonumber(oldest[2]) + w.windowS * 1000 - now)
  end
end
if wait > 0 then return wait end
redis.call('ZADD', KEYS[1], now, ARGV[3])
redis.call('PEXPIRE', KEYS[1], horizon)
return 0
`;

export class CaptchaRateLimitException extends HttpException {
  constructor(retryAfter: number) {
    super(
      { code: ErrorCodes.CAPTCHA_RATE_LIMITED, message: 'Too many captcha requests.', retryAfter },
      HttpStatus.TOO_MANY_REQUESTS
    );
  }
}

@Injectable()
export class CaptchaRateLimitService {
  private readonly logger = new Logger(CaptchaRateLimitService.name);

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: RedisClient,
    private readonly policy: CaptchaPolicyService
  ) {}

  key(kind: CaptchaKind, subject: string, action: 'issue' | 'verify'): string {
    const digest = createHash('sha256')
      .update(JSON.stringify([kind, subject]))
      .digest('hex');
    return `${this.policy.redisPrefix}:{${digest}}:${action}`;
  }

  async reserve(kind: CaptchaKind, subject: string, action: 'issue' | 'verify'): Promise<void> {
    const policy = this.policy.policies[kind];
    const windows: RateWindow[] = action === 'issue' ? policy.issueLimits : policy.verifyLimits;
    let wait: number;
    try {
      wait = Number(
        await withRedisTimeout(
          this.redis.eval(CAPTCHA_RATE_SCRIPT, {
            keys: [this.key(kind, subject, action)],
            arguments: [
              String(action === 'issue' ? policy.issueIntervalS * 1000 : 0),
              JSON.stringify(windows),
              randomBytes(16).toString('hex'),
            ],
          }),
          2000,
          'captcha rate limit'
        )
      );
      if (!Number.isFinite(wait) || wait < 0) throw new Error();
    } catch {
      this.logger.error({ event: 'captcha_dependency_failed', dependency: 'redis', kind });
      throw new ServiceUnavailableException({
        code: ErrorCodes.CAPTCHA_UNAVAILABLE,
        message: 'Captcha service unavailable.',
      });
    }
    if (wait > 0) {
      this.logger.warn({ event: 'captcha_rate_limited', kind, action });
      throw new CaptchaRateLimitException(Math.max(1, Math.ceil(wait / 1000)));
    }
  }
}
