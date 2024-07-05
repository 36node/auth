import { EmailTransporter } from 'src/lib/email';
import { toBoolean } from 'src/lib/lang/boolean';
import { loadEnv } from 'src/lib/utils/env';

export const transporter = loadEnv('EMAIL_TRANSPORTER') as EmailTransporter;

export const nodemailer = {
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
};

export const postmark = {
  serverToken: loadEnv('POSTMARK_API_TOKEN'),
};
