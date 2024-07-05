import { toInteger } from 'lodash';

import { loadEnv } from 'src/lib/utils/env';

export const expiresInS = toInteger(loadEnv('CAPTCHA_EXPIRES_IN_S')); // 过期时间
export const codeLength = toInteger(loadEnv('CAPTCHA_CODE_LENGTH')); // 验证码长度
