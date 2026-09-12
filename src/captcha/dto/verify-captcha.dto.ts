import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { CaptchaContextDto } from './create-captcha.dto';

export class VerifyCaptchaDto extends CaptchaContextDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  key: string;
}

export class VerifyCaptchaResultDto {
  @IsBoolean()
  success: boolean;
}
