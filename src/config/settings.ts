import { env } from './env';

export const settings = env({
  port: 9527,
  prefix: '/auth/v1',
  mqtt: {
    url: 'mqtt://localhost:1883',
    username: 'admin',
    password: 'admin',
    group: 'haivivi',
  },
  mongo: {
    url: 'mongodb://localhost:27017/haivivi-auth-dev',
    test: 'mongodb://localhost:27017',
  },
  redis: {
    url: 'redis://localhost',
  },
  registerOnLogin: true,
  email: {
    transporter: 'nodemailer',
    nodemailer: {
      host: 'smtp.qq.com',
      port: 465,
      secure: true,
      authorize: false,
      username: 'haivivi',
      password: 'haivivi',
    },
    postmark: {
      token: 'POSTMARK_API_TOKEN',
    },
  },
  captcha: {
    fake: true,
    fake_code: '123456',
    expireAt: 300, // 300s
    length: 6, // 长度
    sms: {
      keyId: 'id',
      keySecret: 'secret',
      sign: 'haivivi',
      template: 'SMS_123456789',
      templateInternation: 'SMS_123456789',
    },
    email: {
      from: 'haivivi@qq.com',
      subject: '验证码', // 邮件主题
      templatePath: 'templates/email.txt',
    },
  },
  init: {
    namespace: {
      name: 'root',
      key: 'root',
    },
    user: {
      username: 'root',
      password: 'Hai12345',
      name: '超级管理员',
      super: true,
    },
    key: 'root-session-key',
  },
  preset: {
    enabled: false,
    namespace: {
      name: 'haivivi.cn',
      key: 'haivivi.cn',
      registerDefaultRoles: ['biz:user'],
    },
    users: [
      {
        username: 'admin',
        password: 'Hai12345',
        name: 'Haivivi 系统管理员',
        ns: 'haivivi.cn',
        roles: ['sys:service'],
      },
    ],
  },
  access: {
    control: {
      file: 'access.yaml',
      watch: false,
    },
  },
  identityVerify: {
    fake: true,
    fakeName: '张三',
    fakeIdentity: '888888888888888888',
    appCode: 'appCode',
  },
  // Include a combination of three out of the following: uppercase letters, lowercase letters, numbers, and special characters. Additionally, its length must be between 8 to 64 characters.
  // 包含 大写字母、小写字母、数字、特殊字符 中的三种组合，长度在 8-64 之间
  passwordRegExpString:
    '^(?:(?=(.*\\d))(?=(.*[A-Z]))(?=(.*[a-z]))|(?=(.*\\d))(?=(.*[A-Z]))(?=(.*[\\W_]))|(?=(.*\\d))(?=(.*[a-z]))(?=(.*[\\W_]))|(?=(.*[A-Z]))(?=(.*[a-z]))(?=(.*[\\W_]))).{8,64}$',
});
