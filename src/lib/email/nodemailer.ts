// lib/nodemailerTransport.ts
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { EmailTransport, SendEmailOptions } from './transporter';

export type NodemailerTransportOptions = SMTPTransport.Options;

export class NodemailerTransport implements EmailTransport {
  private transporter: nodemailer.Transporter;

  constructor(opts: NodemailerTransportOptions) {
    this.transporter = nodemailer.createTransport(opts);
  }

  sendEmail(options: SendEmailOptions): Promise<any> {
    const body = options.useHtml
      ? {
          html: options.content,
        }
      : {
          text: options.content,
        };

    return this.transporter.sendMail({
      from: options.from, // sender address
      to: options.to, // list of receivers
      subject: options.subject, // Subject line
      ...body,
    });
  }
}
