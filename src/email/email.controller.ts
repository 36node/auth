import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
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
  constructor(
    private readonly emailRecordService: EmailRecordService,
    private readonly emailService: EmailService
  ) {}

  /**
   * Send plain text email
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
      await this.emailService.sendEmail(body);
    } catch (error) {
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
