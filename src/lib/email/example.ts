import { Mailer } from './mailer';
import { EmailTransporter } from './transporter';

// Using Nodemailer
const nodemailerOptions = {
  pool: true,
  host: 'smtp.qq.com',
  port: 465,
  secure: true,
  tls: {
    rejectUnauthorized: false,
  },
  auth: {
    user: 'test@qq.com',
    pass: 'testpassword',
  },
};

const nodemailer = new Mailer({
  transporter: EmailTransporter.NODEMAILER,
  options: nodemailerOptions,
});

const mailBody = {
  from: 'test@qq.com',
  to: 'zzswang@36node.com',
  subject: 'Nodemailer email e2e',
  useHtml: true,
  content: '<p>Hello, this is a test email.</p>',
};

// using node mailer
nodemailer
  .send(mailBody)
  .then(() => {
    console.log('Nodemailer: Email sent successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Nodemailer: Failed to send email', error);
    process.exit(-1);
  });

// using Postmark
const postmarkOptions = {
  serverToken: 'postmark-server-token',
};

const postmark = new Mailer({
  transporter: EmailTransporter.POSTMARK,
  options: postmarkOptions,
});

postmark
  .send(mailBody)
  .then(() => {
    console.log('Postmail: Email sent successfully');
  })
  .catch((error) => {
    console.error('Postmail: Failed to send email', error);
  });
