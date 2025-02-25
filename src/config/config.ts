import { toInteger, trimStart } from 'lodash';

import { EmailTransporter } from 'src/lib/email';
import { toBoolean } from 'src/lib/lang/boolean';
import { toUpperSnakeCase } from 'src/lib/lang/string';

import { loadEnv } from '../lib/utils/env';

export const port = loadEnv('PORT');
export const prefix = trimStart(loadEnv('PREFIX') || '', '/');

export const auth = {
  maxLoginAttempts: toInteger(loadEnv('MAX_LOGIN_ATTEMPTS')), // 过期时间
  loginLockInS: toInteger(loadEnv('LOGIN_LOCK_IN_S')), // 验证码长度
  jwtSecretKey: loadEnv('JWT_SECRET_KEY'), // jwt secret key
  apiKey: loadEnv('API_KEY'), // api key
};

export const captcha = {
  expiresInS: toInteger(loadEnv('CAPTCHA_EXPIRES_IN_S')), // 过期时间
  codeLength: toInteger(loadEnv('CAPTCHA_CODE_LENGTH')), // 验证码长度
};

export const email = {
  transporter: loadEnv('EMAIL_TRANSPORTER') as EmailTransporter,
  nodemailer: {
    pool: true,
    host: loadEnv('NODEMAILER_HOST'),
    port: Number(loadEnv('NODEMAILER_PORT')),
    secure: toBoolean(loadEnv('NODEMAILER_SECURE')),
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
  url: loadEnv('MONGO_URL'),
};

export const redis = {
  url: loadEnv('REDIS_URL'),
};

export const sms = {
  aliyun: {
    keyId: loadEnv('ALIYUN_SMS_KEY_ID'),
    keySecret: loadEnv('ALIYUN_SMS_KEY_SECRET'),
  },
};

export const user = {
  identityVerify: {
    appCode: 'appCode',
  },
};

export const oauthProvider = {
  clientId: (provider: string) => loadEnv(`${toUpperSnakeCase(provider)}_CLIENT_ID`),
  clientSecret: (provider: string) => loadEnv(`${toUpperSnakeCase(provider)}_CLIENT_SECRET`),
  authorizeUrl: (provider: string) => loadEnv(`${toUpperSnakeCase(provider)}_AUTHORIZE_URL`),
  accessTokenUrl: (provider: string) => loadEnv(`${toUpperSnakeCase(provider)}_ACCESS_TOKEN_URL`),
  userInfoUrl: (provider: string) => loadEnv(`${toUpperSnakeCase(provider)}_USER_INFO_URL`),
  tidField: (provider: string) => loadEnv(`${toUpperSnakeCase(provider)}_TID_FIELD`), // 第三方登录的用户唯一标识字段
};

export const github = {
  clientId: loadEnv('GITHUB_CLIENT_ID'),
  clientSecret: loadEnv('GITHUB_CLIENT_SECRET'),
  authorizeUrl: loadEnv('GITHUB_AUTHORIZE_URL', {
    default: 'https://github.com/login/oauth/authorize',
  }),
  accessTokenUrl: loadEnv('GITHUB_ACCESS_TOKEN_URL', {
    default: 'https://github.com/login/oauth/access_token',
  }),
  userInfoUrl: loadEnv('GITHUB_USER_INFO_URL', {
    default: 'https://api.github.com/user',
  }),
  tidField: loadEnv('GITHUB_TID_FIELD', { default: 'login' }), // 第三方登录的用户唯一标识字段
};
