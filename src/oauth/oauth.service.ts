import { Injectable } from '@nestjs/common';

import { OAuthGetAccessTokenDto } from './dto/oauth.dto';
import { AccessTokenResult } from './entities/access-token-result.entity';

@Injectable()
export class OAuthService {
  async getAccessToken(url: string, dto: OAuthGetAccessTokenDto): Promise<AccessTokenResult> {
    // POST 请求到 ProviderUrl 交换 access_token
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto, (_, value) => (value === undefined ? undefined : value)),
    });

    const data = await response.json();

    if (!data.access_token) {
      throw new Error('Failed to get access token');
    }

    return data;
  }

  async getUserInfo(url: string, accessToken: string): Promise<any> {
    // 向 ProviderUrl 用户信息 API 发送 GET 请求
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        // 必须在请求头中传入 Authorization，格式为：Bearer <access_token>
        // Token type 目前只处理 bearer 类型
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
    return userData;
  }
}
