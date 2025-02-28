import SMSClient from '@alicloud/sms-sdk';
import { Injectable } from '@nestjs/common';

import * as config from 'src/config';

import { SendSmsDto } from './dto/send-sms.dto';

@Injectable()
export class SmsService {
  private aliyunClient: SMSClient;

  constructor() {
    this.aliyunClient = new SMSClient({
      accessKeyId: config.sms.aliyun.keyId,
      secretAccessKey: config.sms.aliyun.keySecret,
    });
  }

  async send(dto: SendSmsDto) {
    const { phone, sign, template, params } = dto;
    const res = await this.aliyunClient.sendSMS({
      PhoneNumbers: phone,
      SignName: sign,
      TemplateCode: template,
      TemplateParam: params ? JSON.stringify(params) : undefined,
    });
    if (res.Code !== 'OK') {
      console.error(
        `Message: ${res.Message} RequestId: ${res.RequestId} BizId:${res.BizId} Code: ${res.Code}`
      );
      throw new Error(res.Message);
    }
  }
}
