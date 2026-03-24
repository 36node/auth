import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import createDebug from 'debug';

import { ErrorCodes } from 'src/constants';

import { CreateEmailRecordDto } from './dto/create-email-record.dto';
import { SendEmailDto } from './dto/send-email.dto';
import { EmailRecordService } from './email-record.service';
import { EmailService } from './email.service';
import { EmailStatus } from './entities/email-record.entity';

const debug = createDebug('auth:email');

@ApiTags('email')
@Controller('email')
export class EmailController {
  constructor(
    private readonly emailRecordService: EmailRecordService,
    private readonly emailService: EmailService
  ) {}

  /**
   * Send email
   */
  @ApiOperation({ operationId: 'sendEmail' })
  @ApiNoContentResponse({ description: 'No content.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('@sendEmail')
  async sendEmail(@Body() body: SendEmailDto) {
    const dto: CreateEmailRecordDto = {
      ...body,
      status: EmailStatus.PENDING,
    };
    const record = await this.emailRecordService.create(dto);

    try {
      debug('sending email to %s, subject: %s', body.to, body.subject);
      await this.emailService.sendEmail(body);
      debug('email sent successfully to %s', body.to);
    } catch (error) {
      console.error('Failed to send email to %s', body.to, error);
      throw new InternalServerErrorException({
        code: ErrorCodes.EMAIL_SEND_FAILED,
        message: 'Failed to send email',
        error,
      });
    }
    await this.emailRecordService.update(record.id, {
      status: EmailStatus.SENT,
      sentAt: new Date(),
    });
  }
}
