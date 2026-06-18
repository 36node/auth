export enum EmailTransporter {
  NODEMAILER = 'nodemailer',
  POSTMARK = 'postmark',
  BLACKHOLE = 'blackhole',
}

export interface SendEmailOptions {
  from: string;
  to: string;
  subject: string;
  content: string;
  useHtml?: boolean;
}

export interface EmailTransport {
  sendEmail(options: SendEmailOptions): Promise<any>;
}
