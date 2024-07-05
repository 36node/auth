import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { EmailTransporter, Mailer } from 'src/lib/email';

import * as config from './config';
import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class EmailService {
  private mailer: Mailer;

  constructor() {
    switch (config.transporter) {
      case EmailTransporter.NODEMAILER:
        this.mailer = new Mailer({
          transporter: EmailTransporter.NODEMAILER,
          options: config.nodemailer,
        });
        break;
      case EmailTransporter.POSTMARK:
        this.mailer = new Mailer({
          transporter: EmailTransporter.POSTMARK,
          options: config.postmark,
        });
        break;
      default:
        throw new InternalServerErrorException(
          `Unsupported email transporter: ${config.transporter}`
        );
    }
  }

  sendEmail(dto: SendEmailDto) {
    return this.mailer.send({
      ...dto,
      useHtml: false,
    });
  }

  sendHtmlEmail(dto: SendEmailDto) {
    return this.mailer.send({
      ...dto,
      useHtml: true,
    });
  }
}
