import { toInteger, trimStart } from 'lodash';

import { EmailTransporter } from 'src/lib/email';
import { toBoolean } from 'src/lib/lang/boolean';
import { toUpperSnakeCase } from 'src/lib/lang/string';

import { loadEnv } from '../lib/utils/env';

export const port = loadEnv('PORT', { default: '9527' });
export const prefix = trimStart(loadEnv('PREFIX') || '', '/');

export const auth = {
  maxLoginAttempts: toInteger(loadEnv('MAX_LOGIN_ATTEMPTS', { default: '5' })),
  loginLockInS: toInteger(loadEnv('LOGIN_LOCK_IN_S', { default: '60' })),
  jwtSecretKey: loadEnv('JWT_SECRET_KEY'),
  apiKey: loadEnv('API_KEY', { default: 'YHImpSchS4iEwVD1IxXp4012' }),
  refreshTokenExpiresIn: loadEnv('REFRESH_TOKEN_EXPIRES_IN', { default: '7d' }),
  tokenExpiresIn: loadEnv('TOKEN_EXPIRES_IN', { default: '1d' }),
};

export const captcha = {
  expiresInS: toInteger(loadEnv('CAPTCHA_EXPIRES_IN_S', { default: '300' })),
  codeLength: toInteger(loadEnv('CAPTCHA_CODE_LENGTH', { default: '6' })),
};

export const email = {
  transporter: loadEnv('EMAIL_TRANSPORTER', { default: 'nodemailer' }) as EmailTransporter,
  nodemailer: {
    pool: true,
    host: loadEnv('NODEMAILER_HOST', { default: 'smtp.qq.com' }),
    port: Number(loadEnv('NODEMAILER_PORT', { default: '465' })),
    secure: toBoolean(loadEnv('NODEMAILER_SECURE', { default: 'true' })),
    tls: {
      rejectUnauthorized: false,
    },
    auth: {
      user: loadEnv('NODEMAILER_AUTH_USER'),
      pass: loadEnv('NODEMAILER_AUTH_PASS'),
    },
  },
  postmark: {
    serverToken: loadEnv('POSTMARK_API_TOKEN'),
  },
};

export const mongo = {
  url: loadEnv('MONGO_URL', { default: 'mongodb://localhost/auth-dev' }),
};

export const redis = {
  url: loadEnv('REDIS_URL', { default: 'redis://localhost' }),
};

export const sms = {
  provider: loadEnv('SMS_PROVIDER', { default: 'blackhole' }),
  aliyun: {
    keyId: loadEnv('ALIYUN_KEY'),
    keySecret: loadEnv('ALIYUN_SECRET'),
  },
  volcengine: {
    account: loadEnv('VOLCENGINE_SMS_ACCOUNT'), // 消息组 ID
    accessKeyId: loadEnv('VOLCENGINE_KEY'),
    secretKey: loadEnv('VOLCENGINE_SECRET'),
  },
};

export const phoneQuickAuth = {
  jiguang: {
    appKey: loadEnv('JIGUANG_PHONE_QUICK_AUTH_APP_KEY'),
    masterSecret: loadEnv('JIGUANG_PHONE_QUICK_AUTH_MASTER_SECRET'),
    privateKey: loadEnv('JIGUANG_PHONE_QUICK_AUTH_PRIVATE_KEY'),
  },
};

export const user = {
  identityVerify: {
    provider: loadEnv('IDENTITY_VERIFY_PROVIDER', { default: 'aliyun' }),
    aliyun: {
      appCode: loadEnv('ALIYUN_IDENTITY_VERIFY_APP_CODE'),
    },
    volcengine: {
      appId: loadEnv('VOLCENGINE_IDENTITY_VERIFY_APP_ID'),
      accessKeyId: loadEnv('VOLCENGINE_IDENTITY_VERIFY_KEY'),
      secretKey: loadEnv('VOLCENGINE_IDENTITY_VERIFY_SECRET'),
      endpoint: loadEnv('VOLCENGINE_IDENTITY_VERIFY_ENDPOINT'),
    },
  },
};

export const oauthProvider = {
  clientId: (provider: string) =>
    loadEnv(`${toUpperSnakeCase(provider)}_CLIENT_ID`, { required: true }),
  clientSecret: (provider: string) =>
    loadEnv(`${toUpperSnakeCase(provider)}_CLIENT_SECRET`, { required: true }),
  authorizeUrl: (provider: string) =>
    loadEnv(`${toUpperSnakeCase(provider)}_AUTHORIZE_URL`, { required: true }),
  accessTokenUrl: (provider: string) =>
    loadEnv(`${toUpperSnakeCase(provider)}_ACCESS_TOKEN_URL`, { required: true }),
  userInfoUrl: (provider: string) =>
    loadEnv(`${toUpperSnakeCase(provider)}_USER_INFO_URL`, { required: true }),
  tidField: (provider: string) =>
    loadEnv(`${toUpperSnakeCase(provider)}_TID_FIELD`, { required: true }), // 第三方登录的用户唯一标识字段
  getTokenUseQuery: (provider: string) =>
    toBoolean(loadEnv(`${toUpperSnakeCase(provider)}_GET_TOKEN_USE_QUERY`)),
};

export const namespace = {
  delimiter: loadEnv('NS_DELIMITER', { default: '/' }), // 命名空间树形路径分隔符
};

export const defaultUser = {
  username: loadEnv('DEFAULT_USER_USERNAME', { default: 'admin' }),
  password: loadEnv('DEFAULT_USER_PASSWORD', { default: 'admin@36node.com' }), // 注意：实际应用中请使用更安全的密码处理方式
  email: loadEnv('DEFAULT_USER_EMAIL', { default: 'admin@36node.com' }),
  roles: loadEnv('DEFAULT_USER_ROLES', { default: 'admin' })
    .split(',')
    .map((role) => role.trim()),
};

export const rootSession = {
  key: loadEnv('ROOT_SESSION_KEY'),
  expires: '10y',
};
