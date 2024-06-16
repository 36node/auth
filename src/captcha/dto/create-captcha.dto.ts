import { OmitType, PartialType, PickType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

import { CaptchaDoc } from '../entities/captcha.entity';

export class CreateCaptchaDto extends OmitType(CaptchaDoc, ['expireAt']) {}

export class UpsertCaptchaDto extends PartialType(OmitType(CreateCaptchaDto, ['key'])) {}

export class CreateCaptchaByKeyDto extends OmitType(CreateCaptchaDto, ['code']) {}

export class CreateCaptchaBySmsDto extends PickType(CaptchaDoc, ['purpose', 'scope']) {
  /**
   * 手机号，必填
   */
  @IsNotEmpty()
  @IsString()
  phone: string;

  /**
   * 区号，必填
   */
  @IsNotEmpty()
  @IsString()
  dialingPrefix: string;
}

export class CreateCaptchaByEmailDto extends PickType(CaptchaDoc, ['purpose', 'scope']) {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;
}

export class CreateCaptchaByPhotoDto extends PickType(CaptchaDoc, ['purpose', 'key', 'scope']) {}
