import { IntersectionType, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

import { QueryDto } from 'src/common';

import { CaptchaContextDto } from './create-captcha.dto';

export class ListCaptchasQuery extends IntersectionType(PartialType(CaptchaContextDto), QueryDto) {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  key?: string;
}
