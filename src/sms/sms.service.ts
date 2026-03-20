import SMSClient from '@alicloud/sms-sdk';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as sms from '@volcengine/openapi/lib/services/sms';

import * as config from 'src/config';

import { SendSmsDto } from './dto/send-sms.dto';

@Injectable()
export class SmsService {
  private aliyunClient?: SMSClient;
  private volcengineClient?: sms.SmsService;

  async send(dto: SendSmsDto) {
    const provider = this.getProvider();
    switch (provider) {
      case 'aliyun':
        await this.sendByAliyun(dto);
        return;
      case 'volcengine':
        await this.sendByVolcengine(dto);
        return;
      default:
        throw new InternalServerErrorException(`Unsupported sms provider: ${provider}`);
    }
  }

  private getProvider(): string {
    return (config.sms.provider || 'aliyun').toLowerCase();
  }

  private getAliyunClient(): SMSClient {
    if (!this.aliyunClient) {
      this.aliyunClient = new SMSClient({
        accessKeyId: config.sms.aliyun.keyId,
        secretAccessKey: config.sms.aliyun.keySecret,
      });
    }
    return this.aliyunClient;
  }

  private async sendByAliyun(dto: SendSmsDto) {
    const { phone, sign, template, params } = dto;
    const res = await this.getAliyunClient().sendSMS({
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

  private getVolcengineClient(): SMSClient {
    if (!this.volcengineClient) {
      this.volcengineClient = new sms.SmsService();
      this.volcengineClient.setAccessKeyId(config.sms.volcengine.accessKeyId);
      this.volcengineClient.setSecretKey(config.sms.volcengine.secretKey);
    }
    return this.volcengineClient;
  }

  private async sendByVolcengine(dto: SendSmsDto) {
    const { phone, sign, template, params } = dto;
    const res = await this.getVolcengineClient().Send({
      SmsAccount: config.sms.volcengine.account,
      Sign: sign,
      TemplateID: template,
      PhoneNumbers: phone,
      TemplateParam: params ? JSON.stringify(params) : undefined,
    });
    if (res.ResponseMetadata.Error) {
      console.error(
        `Message: ${res.ResponseMetadata?.Error?.Message} RequestId: ${res.ResponseMetadata?.RquestId} Service: ${res.ResponseMetadata?.Service} Code: ${res.ResponseMetadata?.Error?.Code}`
      );
      throw new Error(res.ResponseMetadata?.Error?.Message);
    }
  }
}
