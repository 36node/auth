import axios from 'axios';

import * as config from 'src/config';

export async function verifyIdentity(name: string, identity: string): Promise<boolean> {
  const response = await axios.get('https://zidv2.market.alicloudapi.com/idcard/VerifyIdcardv2', {
    params: {
      realName: name,
      cardNo: identity,
    },
    headers: {
      Authorization: `APPCODE ${config.user.identityVerify.appCode}`,
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
