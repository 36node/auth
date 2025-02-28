import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

import * as config from 'src/config';
import { ThirdPartyService } from 'src/third-party/third-party.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType,
    private readonly thirdPartyService: ThirdPartyService
  ) {}

  async isLocked(login: string): Promise<boolean> {
    const lock = await this.redisClient.hGetAll(`loginLock:${login}`);
    if (!lock || !lock.attempts) return false;

    return Number(lock.attempts) >= config.auth.maxLoginAttempts;
  }

  async lock(login: string): Promise<void> {
    const lockKey = `loginLock:${login}`;
    const lock = await this.redisClient.hGetAll(lockKey);
    const attempts = lock.attempts ? Number(lock.attempts) + 1 : 1;

    await this.redisClient.hSet(lockKey, {
      lastAttempt: Date.now().toString(),
      attempts: attempts.toString(),
    });

    // 设置过期时间为登录锁定时长（秒）
    await this.redisClient.expire(lockKey, config.auth.loginLockInS);
  }
}
