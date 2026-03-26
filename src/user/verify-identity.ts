import crypto from 'node:crypto';

import axios from 'axios';

import * as config from 'src/config';

export async function verifyIdentity(name: string, identity: string): Promise<boolean> {
  const provider = getProvider();
  switch (provider) {
    case 'aliyun':
      return verifyIdentityByAliyun(name, identity);
    case 'volcengine':
      return verifyIdentityByVolcengine(name, identity);
    default:
      throw new Error(`Unsupported identity verify provider: ${provider}`);
  }
}

function getProvider(): string {
  return (config.user.identityVerify.provider || 'aliyun').toLowerCase();
}

async function verifyIdentityByAliyun(name: string, identity: string): Promise<boolean> {
  const response = await axios.get('https://zidv2.market.alicloudapi.com/idcard/VerifyIdcardv2', {
    params: {
      realName: name,
      cardNo: identity,
    },
    headers: {
      Authorization: `APPCODE ${config.user.identityVerify.aliyun.appCode}`,
    },
  });

  const { error_code, reason, result } = response.data ?? {};

  if (error_code === undefined) {
    throw new Error('没有返回 error_code');
  }

  if (error_code !== 0) {
    throw new Error(reason || '未知错误');
  }

  return result?.isok === true;
}

const VOLCENGINE_API_CONFIG = {
  service: 'idcard_two_element_verify',
  version: '2022-04-13',
  action: 'ElementVerify',
};

async function verifyIdentityByVolcengine(name: string, id: string): Promise<boolean> {
  const { appId, accessKeyId, secretKey, endpoint } = config.user.identityVerify.volcengine;
  if (!name || !id) {
    return false;
  }
  const parameters: any = {
    idcard_name: name,
    idcard_no: id,
  };

  const timestamp = Math.round(Date.now() / 1000);
  parameters.operate_time = timestamp;

  const data = {
    AppId: appId,
    Service: VOLCENGINE_API_CONFIG.service,
    Parameters: JSON.stringify(parameters),
  };

  const nonce = crypto.randomBytes(16).toString('hex');
  const digest = crypto
    .createHmac('sha256', secretKey)
    .update(`${nonce}&${timestamp}`)
    .digest('hex');
  const signature = Buffer.from(digest, 'hex').toString('base64');

  const sharkAuth = {
    access_key_id: accessKeyId,
    nonce,
    signature,
    signature_method: 'HMAC-SHA256',
    timestamp,
  };

  const res = await axios.post(endpoint, data, {
    headers: {
      'Content-Type': 'application/json',
      'X-Shark-Auth': JSON.stringify(sharkAuth),
    },
  });

  if (res.data.Result.Code !== 0) {
    throw new Error(
      `Volcengine identity verify failed ${res.data.Result.Code}: ${res.data.Result.Message}`
    );
  }

  return res.data.Result.Data?.Status === 10001;
}
