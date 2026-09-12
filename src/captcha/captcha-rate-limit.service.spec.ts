import { randomBytes } from 'crypto';

import * as config from 'src/config';
import { createRedisClient, RedisClient } from 'src/redis/client';

import { CaptchaKind, CaptchaPolicyService } from './captcha-policy.service';
import { CaptchaRateLimitService } from './captcha-rate-limit.service';

// Seed only this test's own sorted sets relative to Redis TIME. Never flush shared Redis.
const SEED = `local t=redis.call('TIME'); local now=tonumber(t[1])*1000+math.floor(tonumber(t[2])/1000); for i,age in ipairs(cjson.decode(ARGV[1])) do redis.call('ZADD',KEYS[1],now-age,'seed-'..i) end; redis.call('EXPIRE',KEYS[1],86400); return 1`;

describe('Captcha Redis limits', () => {
  let redis: RedisClient;
  let policy: CaptchaPolicyService;
  let service: CaptchaRateLimitService;
  const keys = new Set<string>();
  const subject = () => randomBytes(16).toString('hex');
  const key = (kind: CaptchaKind, id: string, action: 'issue' | 'verify') => {
    const value = service.key(kind, id, action);
    keys.add(value);
    return value;
  };
  const seed = (k: string, ages: number[]) =>
    redis.eval(SEED, { keys: [k], arguments: [JSON.stringify(ages)] });

  beforeAll(async () => {
    redis = await createRedisClient(config.redis.url);
  });
  beforeEach(() => {
    policy = new CaptchaPolicyService();
    service = new CaptchaRateLimitService(redis, policy);
  });
  afterEach(async () => {
    await Promise.all([...keys].map((k) => redis.del(k)));
    keys.clear();
  });
  afterAll(async () => {
    await redis?.disconnect();
  });

  it.each([CaptchaKind.IMAGE, CaptchaKind.SMS, CaptchaKind.EMAIL])(
    'enforces %s issue cooldown with Retry-After',
    async (kind) => {
      const id = subject();
      key(kind, id, 'issue');
      await service.reserve(kind, id, 'issue');
      await expect(service.reserve(kind, id, 'issue')).rejects.toMatchObject({
        status: 429,
        response: { retryAfter: policy.policies[kind].issueIntervalS },
      });
    }
  );

  it.each([CaptchaKind.SMS, CaptchaKind.EMAIL])(
    'enforces %s hour/day quotas independently of cooldown',
    async (kind) => {
      const id = subject(),
        k = key(kind, id, 'issue');
      await seed(k, [61000, 121000, 181000, 241000, 301000]);
      await expect(service.reserve(kind, id, 'issue')).rejects.toMatchObject({ status: 429 });
      await redis.del(k);
      await seed(
        k,
        Array.from({ length: 10 }, (_, i) => 3601000 + i * 61000)
      );
      await expect(service.reserve(kind, id, 'issue')).rejects.toMatchObject({ status: 429 });
      await redis.del(k);
      await seed(
        k,
        Array.from({ length: 10 }, (_, i) => 86401000 + i * 1000)
      );
      await expect(service.reserve(kind, id, 'issue')).resolves.toBeUndefined();
    }
  );

  it('enforces the image rolling minute quota', async () => {
    const id = subject(),
      k = key(CaptchaKind.IMAGE, id, 'issue');
    await seed(
      k,
      Array.from({ length: 20 }, (_, i) => 1100 + i * 1000)
    );
    await expect(service.reserve(CaptchaKind.IMAGE, id, 'issue')).rejects.toMatchObject({
      status: 429,
    });
  });

  it.each([CaptchaKind.IMAGE, CaptchaKind.SMS, CaptchaKind.EMAIL])(
    'shares %s verification quota across instances and issuance',
    async (kind) => {
      const id = subject();
      key(kind, id, 'verify');
      key(kind, id, 'issue');
      const other = new CaptchaRateLimitService(redis, new CaptchaPolicyService());
      const limit = policy.policies[kind].verifyLimits[0].limit;
      const attempts = await Promise.allSettled(
        Array.from({ length: limit + 20 }, (_, i) =>
          (i % 2 ? service : other).reserve(kind, id, 'verify')
        )
      );
      expect(attempts.filter((r) => r.status === 'fulfilled')).toHaveLength(limit);
      await service.reserve(kind, id, 'issue');
      await expect(other.reserve(kind, id, 'verify')).rejects.toMatchObject({ status: 429 });
    }
  );

  it('allows verification after the rolling window expires and hides the subject in keys', async () => {
    const id = 'private@example.com',
      k = key(CaptchaKind.EMAIL, id, 'verify');
    expect(k).not.toContain(id);
    await seed(
      k,
      Array.from({ length: 20 }, (_, i) => 600001 + i)
    );
    await expect(service.reserve(CaptchaKind.EMAIL, id, 'verify')).resolves.toBeUndefined();
  });

  it('fails closed on unavailable Redis without returning its error', async () => {
    const unavailable = {
      eval: jest.fn().mockRejectedValue(new Error('redis://secret-credentials')),
    } as any;
    const isolated = new CaptchaRateLimitService(unavailable, policy);
    await expect(isolated.reserve(CaptchaKind.SMS, 'subject', 'verify')).rejects.toMatchObject({
      status: 503,
      response: { message: 'Captcha service unavailable.' },
    });
  });
  it('returns 503 after the Redis deadline without retrying the command', async () => {
    const stuck = { eval: jest.fn().mockReturnValue(new Promise(() => undefined)) } as any;
    const isolated = new CaptchaRateLimitService(stuck, policy);
    jest.useFakeTimers();
    try {
      const rejected = expect(
        isolated.reserve(CaptchaKind.SMS, 'subject', 'verify')
      ).rejects.toMatchObject({ status: 503 });
      await jest.advanceTimersByTimeAsync(2001);
      await rejected;
      expect(stuck.eval).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  });
});
