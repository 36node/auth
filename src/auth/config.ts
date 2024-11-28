import { toInteger } from 'lodash';

import { loadEnv } from 'src/lib/utils/env';

export const maxLoginAttempts = toInteger(loadEnv('MAX_LOGIN_ATTEMPTS')); // 过期时间
export const loginLockInS = toInteger(loadEnv('LOGIN_LOCK_IN_S')); // 验证码长度
export const jwtSecretKey = loadEnv('JWT_SECRET_KEY'); // jwt secret key
