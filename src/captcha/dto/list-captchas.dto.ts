import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { QueryDto } from 'src/common';
import { getSortParams } from 'src/lib/sort';

import { CaptchaDoc } from '../entities/captcha.entity';

import { UpdateCaptchaDto } from './update-captcha.dto';

const sortParams = getSortParams(CaptchaDoc);

export class ListCaptchasQuery extends IntersectionType(
  PickType(UpdateCaptchaDto, ['code', 'key'] as const),
  OmitType(QueryDto, ['_sort'])
) {
  /**
   * 排序参数
   */
  @IsOptional()
  @IsString()
  @ApiProperty({ enum: sortParams })
  _sort?: (typeof sortParams)[number];
}
