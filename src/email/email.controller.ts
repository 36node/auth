import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Post,
} from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ErrorCodes } from 'src/constants';

import { CreateEmailRecordDto } from './dto/create-email-record.dto';
import { SendEmailDto } from './dto/send-email.dto';
import { EmailRecordService } from './email-record.service';
import { EmailService } from './email.service';
import { EmailStatus } from './entities/email-record.entity';

@ApiTags('email')
@Controller('email')
export class EmailController {
  private readonly logger = new Logger(EmailController.name);
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
      from: body.from,
      to: body.to,
      status: EmailStatus.PENDING,
    };
    const record = await this.emailRecordService.create(dto);

    try {
      await this.emailService.sendEmail(body);
    } catch {
      this.logger.error({ event: 'email_send_failed', recordId: record.id });
      throw new InternalServerErrorException({
        code: ErrorCodes.EMAIL_SEND_FAILED,
        message: 'Failed to send email',
      });
    }
    this.logger.log({ event: 'email_sent', recordId: record.id });
    await this.emailRecordService.update(record.id, {
      status: EmailStatus.SENT,
      sentAt: new Date(),
    });
  }
}
