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

import { CreateSmsRecordDto } from './dto/create-sms-record.dto';
import { SendSmsDto } from './dto/send-sms.dto';
import { SmsStatus } from './entities/sms-record.entity';
import { SmsRecordService } from './sms-record.service';
import { SmsService } from './sms.service';

@ApiTags('sms')
@Controller('sms')
export class SmsController {
  private readonly logger = new Logger(SmsController.name);
  constructor(
    private readonly smsRecordService: SmsRecordService,
    private readonly smsService: SmsService
  ) {}

  /**
   * Send sms
   */
  @ApiOperation({ operationId: 'sendSms' })
  @ApiNoContentResponse({ description: 'No content.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('@sendSms')
  async sendSms(@Body() body: SendSmsDto) {
    const dto: CreateSmsRecordDto = {
      phone: body.phone,
      sign: body.sign,
      template: body.template,
      account: this.smsService.resolveAccount(body),
      status: SmsStatus.PENDING,
    };
    const record = await this.smsRecordService.create(dto);

    try {
      await this.smsService.send(body);
    } catch {
      this.logger.error({ event: 'sms_send_failed', recordId: record.id });
      throw new InternalServerErrorException({
        code: ErrorCodes.SMS_SEND_FAILED,
        message: 'Failed to send sms',
      });
    }
    this.logger.log({ event: 'sms_sent', recordId: record.id });
    await this.smsRecordService.update(record.id, {
      status: SmsStatus.SENT,
      sentAt: new Date(),
    });
  }
}
