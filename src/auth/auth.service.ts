import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisClientType } from 'redis';

import * as config from 'src/config';
import { addShortTimeSpan } from 'src/lib/lang/time';
import { SessionService } from 'src/session';
import { ThirdPartyDoc } from 'src/third-party';
import { ThirdPartyService } from 'src/third-party/third-party.service';
import { UserDocument, UserService } from 'src/user';

import { JwtPayload } from './entities/jwt.entity';
import { SessionWithToken } from './entities/session-with-token.entity';

@Injectable()
export class AuthService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType,
    private readonly thirdPartyService: ThirdPartyService,
    private readonly sessionService: SessionService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService
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

  login = async (user: UserDocument): Promise<SessionWithToken> => {
    const session = await this.sessionService.create({
      subject: user.id,
      ns: user.ns,
      groups: user.groups,
      type: user.type,
      expireAt: addShortTimeSpan(config.auth.refreshTokenExpiresIn),
    });

    const jwtpayload: JwtPayload = {
      sid: session.id,
      ns: user.ns,
      groups: user.groups,
      type: user.type,
    };

    const tokenExpireAt = addShortTimeSpan(config.auth.tokenExpiresIn);
    const token = this.jwtService.sign(jwtpayload, {
      expiresIn: config.auth.tokenExpiresIn,
      subject: user.id,
    });

    const res: SessionWithToken = {
      ...session.toJSON(),
      token,
      tokenExpireAt,
    };

    this.userService.update(user.id, {
      lastLoginAt: new Date(),
    });

    return res;
  };

  loginByThirdParty = async (thirdParty: ThirdPartyDoc): Promise<SessionWithToken> => {
    const subject = thirdParty.tid;
    const session = await this.sessionService.create({
      subject,
      source: thirdParty.source,
      expireAt: addShortTimeSpan(config.auth.refreshTokenExpiresIn),
    });

    const jwtpayload: JwtPayload = {
      sid: session.id,
      source: thirdParty.source,
    };

    const tokenExpireAt = addShortTimeSpan(config.auth.tokenExpiresIn);
    const token = this.jwtService.sign(jwtpayload, {
      expiresIn: config.auth.tokenExpiresIn,
      subject,
    });

    const res: SessionWithToken = {
      ...session.toJSON(),
      token,
      tokenExpireAt,
    };

    return res;
  };
}
