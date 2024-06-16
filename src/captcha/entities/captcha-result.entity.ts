import { PickType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

import { CaptchaDoc } from './captcha.entity';

export class CaptchaBySmsResult extends PickType(CaptchaDoc, [
  'purpose',
  'scope',
  'dialingPrefix',
  'expireAt',
]) {
  @IsNotEmpty()
  @IsString()
  phone: string;
}

export class CaptchaByEmailResult extends PickType(CaptchaDoc, ['purpose', 'scope', 'expireAt']) {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;
}

export class CaptchaByPhotoResult extends PickType(CaptchaDoc, [
  'purpose',
  'scope',
  'key',
  'expireAt',
]) {
  /**
   * gif 图片内容
   */
  @IsNotEmpty()
  @IsString()
  capchaGifHex: string;
}
