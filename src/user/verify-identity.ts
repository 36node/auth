import axios from 'axios';
import { get } from 'lodash';

import * as config from 'src/config';

const results = {
  400: '400 参数不能为空',
  401: '401 参数非法',
  402: '402 无权限调用',
  403: '403 异常重复调用',
  500: '系统错误',
};

export async function verifyIdentity(name: string, identity: string): Promise<boolean> {
  const response = await axios.get('http://id2meta.market.alicloudapi.com/id2meta', {
    params: {
      userName: name,
      identifyNum: identity,
    },
    headers: {
      Authorization: `APPCODE ${config.user.identityVerify.appCode}`,
    },
  });

  if (!response.data?.code) {
    throw new Error('没有返回 code');
  }

  if (response.data.code !== '200') {
    throw new Error(results[response.data.code] || '未知错误');
  }

  return get(response.data, 'data.bizCode') === '1';
}
