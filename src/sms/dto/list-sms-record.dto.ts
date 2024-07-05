import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

import { QueryDto } from 'src/common';
import { getSortParams } from 'src/lib/sort';

import { SmsRecordDoc } from '../entities/sms-record.entity';

import { UpdateSmsRecordDto } from './update-sms-record.dto';

const sortParams = getSortParams(SmsRecordDoc);

export class ListSmsRecordQuery extends IntersectionType(
  PickType(UpdateSmsRecordDto, ['phone', 'sign', 'status'] as const),
  OmitType(QueryDto, ['_sort'])
) {
  /**
   * 创建时间大于该时间
   */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdAt_gt?: Date;

  /**
   * 创建时间小于该时间
   */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdAt_lt?: Date;

  /**
   * 发送时间大于该时间
   */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  sentAt_gt?: Date;

  /**
   * 发送时间小于该时间
   */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  sentAt_lt?: Date;

  /**
   * 排序参数
   */
  @IsOptional()
  @IsString()
  @ApiProperty({ enum: sortParams })
  _sort?: (typeof sortParams)[number];
}
