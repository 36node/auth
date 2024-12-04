import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

import { createThirdPartyDto } from 'src/third-party/dto/create-third-party.dto';
import { ThirdPartyDoc, ThirdPartySource } from 'src/third-party/entities/third-party.entity';
import { ThirdPartyService } from 'src/third-party/third-party.service';

import * as config from './config';
import {
  GithubAccessTokenUrl,
  GithubClientId,
  GithubClientSecret,
  GithubUserUrl,
} from './constants';

@Injectable()
export class AuthService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType,
    private readonly thirdPartyService: ThirdPartyService
  ) {}

  async isLocked(login: string): Promise<boolean> {
    const lock = await this.redisClient.hGetAll(`loginLock:${login}`);
    if (!lock || !lock.attempts) return false;

    return Number(lock.attempts) >= config.maxLoginAttempts;
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
    await this.redisClient.expire(lockKey, config.loginLockInS);
  }

  async getGithubAccessToken(code: string): Promise<string> {
    try {
      // POST 请求到 GitHub 交换 access_token
      const response = await fetch(GithubAccessTokenUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: GithubClientId,
          client_secret: GithubClientSecret,
          code,
        }),
      });
      const data = await response.json();
      if (!data.access_token) {
        throw new Error('Failed to get access token');
      }
      return data.access_token;
    } catch (e) {
      console.error(e);
      return '';
    }
  }

  async getGithubUser(accessToken: string): Promise<ThirdPartyDoc> {
    try {
      // 向 GitHub 用户信息 API 发送 GET 请求
      const response = await fetch(GithubUserUrl, {
        method: 'GET',
        headers: {
          // 必须在请求头中传入 Authorization，格式为：Bearer <access_token>
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      // 如果请求失败，比如 token 无效或过期，处理错误
      if (!response.ok) {
        console.error(`Failed to fetch user info: ${response.status} ${response.statusText}`);
        return null;
      }

      // 解析 JSON 返回的用户信息
      const userData = await response.json();
      // 创建或更新第三方登录信息
      const createDto: createThirdPartyDto = {
        login: userData.login,
        source: ThirdPartySource.GITHUB,
        accessToken,
      };
      return this.thirdPartyService.upsert(createDto.login, createDto.source, createDto);
    } catch (error) {
      // 捕获网络或代码错误
      console.error('Error while fetching GitHub user info:', error);
      return null;
    }
  }
}
