process.env.CAPTCHA_REDIS_PREFIX = `auth:test:captcha:${process.pid}`;
process.env.CAPTCHA_POLICY_JSON = '{}';
process.env.SMS_PROVIDER = 'blackhole';
process.env.EMAIL_TRANSPORTER = 'blackhole';
