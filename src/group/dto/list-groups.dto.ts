import { ApiProperty, IntersectionType, OmitType, PartialType, PickType } from '@nestjs/swagger';
import { IsMongoId, IsOptional, IsString } from 'class-validator';

import { QueryDto } from 'src/common';
import { getSortParams } from 'src/lib/sort';

import { GroupDoc } from '../entities/group.entity';

const sortParams = getSortParams(GroupDoc);

export class ListGroupsQuery extends IntersectionType(
  PartialType(PickType(GroupDoc, ['name', 'active'] as const)),
  OmitType(QueryDto, ['_sort'])
) {
  /**
   * 按 id 筛选
   */
  @IsOptional()
  @IsMongoId({ each: true })
  id?: string[];

  /**
   * 名称 模糊查询
   */
  @IsOptional()
  @IsString()
  name_like?: string;

  /**
   * 排序参数
   */
  @IsOptional()
  @IsString()
  @ApiProperty({ enum: sortParams })
  _sort?: (typeof sortParams)[number];
}
