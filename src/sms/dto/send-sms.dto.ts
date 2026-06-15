import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendSmsDto {
  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  sign: string;

  @IsNotEmpty()
  @IsString()
  template: string;

  @IsOptional()
  params?: Record<string, string>;

  /** 火山引擎消息组 ID；未传时使用 VOLCENGINE_SMS_ACCOUNT */
  @IsOptional()
  @IsString()
  account?: string;
}
