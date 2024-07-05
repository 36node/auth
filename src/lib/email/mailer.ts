// lib/mailer.ts
import { NodemailerTransport, NodemailerTransportOptions } from './nodemailer';
import { PostmarkTransport, PostmarkTransportOptions } from './postmark';
import { EmailTransport, EmailTransporter, SendEmailOptions } from './transporter';

interface MailerOptions<T extends EmailTransporter> {
  transporter: T;
  options: SpecificMailerOptions<T>;
}

// 使用条件类型来推断具体的选项类型
type SpecificMailerOptions<T extends EmailTransporter> = T extends EmailTransporter.NODEMAILER
  ? NodemailerTransportOptions
  : T extends EmailTransporter.POSTMARK
  ? PostmarkTransportOptions
  : never;

export class Mailer<T extends EmailTransporter = any> {
  private transport: EmailTransport;

  constructor(options: MailerOptions<T>) {
    switch (options.transporter) {
      case EmailTransporter.NODEMAILER:
        this.transport = new NodemailerTransport(options.options as NodemailerTransportOptions);
        break;
      case EmailTransporter.POSTMARK:
        this.transport = new PostmarkTransport(options.options as PostmarkTransportOptions);
        break;
      default:
        throw new Error('Unsupported email transporter');
    }
  }

  public async send(options: SendEmailOptions): Promise<void> {
    await this.transport.sendEmail(options);
  }
}
