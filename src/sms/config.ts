import { loadEnv } from 'src/lib/utils/env';

export const aliyun = {
  keyId: loadEnv('ALIYUN_SMS_KEY_ID'),
  keySecret: loadEnv('ALIYUN_SMS_KEY_SECRET'),
};
