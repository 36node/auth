import { ApiProperty, IntersectionType, OmitType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { QueryDto } from 'src/common';
import { getSortParams } from 'src/lib/sort';

import { SessionDoc } from '../entities/session.entity';

import { UpdateSessionDto } from './update-session.dto';

const sortParams = getSortParams(SessionDoc);
export class ListSessionQuery extends IntersectionType(
  OmitType(UpdateSessionDto, ['expireAt'] as const),
  OmitType(QueryDto, ['_sort'])
) {
  /**
   * 用 key 进行查询
   */
  @IsOptional()
  @IsString()
  key?: string;

  /**
   * 排序参数
   */
  @IsOptional()
  @IsString()
  @ApiProperty({ enum: sortParams })
  _sort?: (typeof sortParams)[number];
}
