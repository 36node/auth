import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendSmsDto {
  @IsNotEmpty()
  @IsEmail()
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
