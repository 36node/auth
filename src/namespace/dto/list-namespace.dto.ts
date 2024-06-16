import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { QueryDto } from 'src/common';
import { getSortParams } from 'src/lib/sort';

import { NamespaceDoc } from '../entities/namespace.entity';

const sortParams = getSortParams(NamespaceDoc);

export class ListNamespaceQuery extends IntersectionType(
  PickType(NamespaceDoc, ['labels'] as const),
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
  @ApiProperty({ description: 'parent' })
  parent?: string[];

  /**
   * 父级命名空间的scope
   */
  @IsOptional()
  @IsString({ each: true })
  @ApiProperty({ description: 'parent scope' })
  parent_scope?: string[];

  /**
   * 排序参数
   */
  @IsOptional()
  @IsString()
  @ApiProperty({ enum: sortParams })
  _sort?: (typeof sortParams)[number];
}
