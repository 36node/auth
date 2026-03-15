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
}
