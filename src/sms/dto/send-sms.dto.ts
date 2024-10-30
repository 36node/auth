import { IsMobilePhone, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendSmsDto {
  @IsNotEmpty()
  @IsMobilePhone('zh-CN')
  phone: string;

  @IsNotEmpty()
  @IsString()
  sign: string;

  @IsNotEmpty()
  @IsString()
  template: string;

  @IsOptional()
  params?: Record<string, string>;
}
