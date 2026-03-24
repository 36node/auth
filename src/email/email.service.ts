import { Injectable, InternalServerErrorException } from '@nestjs/common';
import createDebug from 'debug';

import * as config from 'src/config';
import { EmailTransporter, Mailer } from 'src/lib/email';

import { SendEmailDto } from './dto/send-email.dto';

const debug = createDebug('auth:email');

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
        debug('email transporter: nodemailer');
        break;
      case EmailTransporter.POSTMARK:
        this.mailer = new Mailer({
          transporter: EmailTransporter.POSTMARK,
          options: config.email.postmark,
        });
        debug('email transporter: postmark');
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
      useHtml: !!dto.useHtml,
    });
  }
}
