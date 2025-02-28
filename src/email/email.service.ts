import { Injectable, InternalServerErrorException } from '@nestjs/common';

import * as config from 'src/config';
import { EmailTransporter, Mailer } from 'src/lib/email';

import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class EmailService {
  private mailer: Mailer;

  constructor() {
    switch (config.email.transporter) {
      case EmailTransporter.NODEMAILER:
        this.mailer = new Mailer({
          transporter: EmailTransporter.NODEMAILER,
          options: config.email.nodemailer,
        });
        break;
      case EmailTransporter.POSTMARK:
        this.mailer = new Mailer({
          transporter: EmailTransporter.POSTMARK,
          options: config.email.postmark,
        });
        break;
      default:
        throw new InternalServerErrorException(
          `Unsupported email transporter: ${config.email.transporter}`
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
