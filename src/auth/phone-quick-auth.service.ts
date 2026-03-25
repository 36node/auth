import { constants, privateDecrypt } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import axios, { AxiosError, AxiosResponse } from 'axios';

import * as config from 'src/config';

@Injectable()
export class PhoneQuickAuthService {
  async _getEncryptedPhone(token: string): Promise<string | null> {
    let response: AxiosResponse;
    try {
      response = await axios.post(
        'https://api.verification.jpush.cn/v1/web/loginTokenVerify',
        {
          loginToken: token,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          auth: {
            username: config.phoneQuickAuth.jiguang.appKey,
            password: config.phoneQuickAuth.jiguang.masterSecret,
          },
        }
      );
      if (response.data.code !== 8000) {
        return null;
      }
      const encryptPhone = response.data.phone;
      return encryptPhone;
    } catch (error) {
      const res = (error as AxiosError).response;
      const data = res?.data as { code?: number; content?: string };
      if (data?.code !== 8001) {
        console.error(`Failed to verify phone quick auth token ${data?.code}`, data);
      }
      return null;
    }
  }

  _decryptPhone(phone: string): string {
    const PREFIX = '-----BEGIN PRIVATE KEY-----';
    const SUFFIX = '-----END PRIVATE KEY-----';
    const key = `${PREFIX}\n${config.phoneQuickAuth.jiguang.privateKey}\n${SUFFIX}`;
    const encryptedPhone = Buffer.from(phone, 'base64');

    return privateDecrypt(
      {
        key,
        padding: constants.RSA_PKCS1_PADDING,
      },
      new Uint8Array(encryptedPhone)
    ).toString('utf8');
  }

  async verify(token: string): Promise<string | null> {
    const encryptedPhone = await this._getEncryptedPhone(token);
    return encryptedPhone ? this._decryptPhone(encryptedPhone) : null;
  }
}
