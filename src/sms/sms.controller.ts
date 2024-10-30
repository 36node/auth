import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ErrorCodes } from './constants';
import { CreateSmsRecordDto } from './dto/create-sms-record.dto';
import { SendSmsDto } from './dto/send-sms.dto';
import { SmsStatus } from './entities/sms-record.entity';
import { SmsRecordService } from './sms-record.service';
import { SmsService } from './sms.service';

@ApiTags('sms')
@Controller('sms')
export class SmsController {
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
      ...body,
      status: SmsStatus.PENDING,
      params: body.params ? JSON.stringify(body.params) : undefined,
    };
    const record = await this.smsRecordService.create(dto);

    try {
      await this.smsService.send(body);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException({
        code: ErrorCodes.SMS_SEND_FAILED,
        message: 'Failed to send sms',
        error: err,
      });
    }
    await this.smsRecordService.update(record.id, {
      status: SmsStatus.SENT,
      sentAt: new Date(),
    });
  }
}
