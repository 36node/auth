import { OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

import { CaptchaDoc } from '../entities/captcha.entity';

export class CreateCaptchaDto extends OmitType(CaptchaDoc, ['code', 'expireAt']) {
  /**
   * 验证码
   */
  @IsOptional()
  @IsString()
  code?: string;

  /**
   * 过期时间
   */
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expireAt?: Date;
}
