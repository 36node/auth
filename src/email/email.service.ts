import fs from 'fs';

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import dayjs from 'dayjs';
import nodemailer from 'nodemailer';
import { ServerClient } from 'postmark';

import { settings } from 'src/config';

import { SendCaptchaEmailDto, SendEmailDto } from './dto/send-email.dto';
import { EmailTransporter } from './entities/email.entity';

@Injectable()
export class EmailService {
  private nodemailerTransporter: nodemailer.Transporter;
  private postmarkClient: ServerClient;
  private transporter: EmailTransporter;

  constructor() {
    this.transporter = settings.email.transporter as EmailTransporter;
    if (this.transporter === EmailTransporter.NODEMAILER) {
      const { host, port, secure, authorize, username, password } = settings.email.nodemailer;
      this.nodemailerTransporter = nodemailer.createTransport({
        host,
        port,
        secure,
        tls: {
          rejectUnauthorized: authorize,
        },
        auth: {
          user: username,
          pass: password,
        },
      });
    } else if (this.transporter === EmailTransporter.POSTMARK) {
      this.postmarkClient = new ServerClient(settings.email.postmark.token);
    } else {
      throw new InternalServerErrorException(`Unsupported email transporter: ${this.transporter}`);
    }
  }

  private getTemplateContent(templatePath: string) {
    return fs.readFileSync(templatePath, 'utf-8');
  }

  private async sendEmail({ from, to, subject, htmlContent }: SendEmailDto) {
    if (this.transporter === EmailTransporter.NODEMAILER) {
      await this.nodemailerTransporter.sendMail({
        from,
        to,
        subject,
        html: htmlContent,
      });
    }
    if (this.transporter === EmailTransporter.POSTMARK) {
      await this.postmarkClient.sendEmail({
        From: from,
        To: to,
        Subject: subject,
        HtmlBody: htmlContent,
      });
    }
  }

  async sendCaptchaEmail({ to, code }: SendCaptchaEmailDto) {
    const { templatePath, from, subject } = settings.captcha.email;
    const templateContent = this.getTemplateContent(templatePath);
    let htmlContent = templateContent.replace(/\{{email}}/gi, to);
    htmlContent = htmlContent.replace(/\{{time}}/gi, dayjs().format('YYYY-MM-DD HH:mm:ss'));
    htmlContent = htmlContent.replace(/\{{code}}/gi, code);
    await this.sendEmail({
      to,
      from,
      subject,
      htmlContent,
    });
  }
}
