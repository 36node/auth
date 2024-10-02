import { ApiProperty, IntersectionType, OmitType, PartialType, PickType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { QueryDto } from 'src/common';
import { getSortParams } from 'src/lib/sort';

import { GroupDoc } from '../entities/group.entity';

const sortParams = getSortParams(GroupDoc);

export class ListGroupsQuery extends IntersectionType(
  PartialType(PickType(GroupDoc, ['name'] as const)),
  OmitType(QueryDto, ['_sort'])
) {
  /**
   * 名称 模糊查询
   */
  @IsOptional()
  @IsString()
  name_like?: string;

  /**
   * 父级命名空间
   */
  @IsOptional()
  @IsString({ each: true })
  @ApiProperty({ description: '所属命名空间' })
  ns?: string[];

  /**
   * 父级命名空间的 scope
   */
  @IsOptional()
  @IsString({ each: true })
  @ApiProperty({ description: '所属命名空间 start 查询' })
  ns_start?: string[];

  /**
   * 排序参数
   */
  @IsOptional()
  @IsString()
  @ApiProperty({ enum: sortParams })
  _sort?: (typeof sortParams)[number];
}
