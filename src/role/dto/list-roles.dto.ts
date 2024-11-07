import { ApiProperty, IntersectionType, OmitType, PartialType, PickType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { QueryDto } from 'src/common';
import { getSortParams } from 'src/lib/sort';

import { RoleDoc } from '../entities/role.entity';

const sortParams = getSortParams(RoleDoc);

export class ListRolesQuery extends IntersectionType(
  PartialType(PickType(RoleDoc, ['name', 'key'] as const)),
  OmitType(QueryDto, ['_sort'])
) {
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
