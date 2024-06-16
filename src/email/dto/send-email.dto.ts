import { PickType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendEmailDto {
  @IsNotEmpty()
  @IsEmail()
  from: string;

  @IsNotEmpty()
  @IsEmail()
  to: string;

  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  htmlContent: string;
}

export class SendCaptchaEmailDto extends PickType(SendEmailDto, ['to'] as const) {
  @IsNotEmpty()
  @IsString()
  code: string;
}
