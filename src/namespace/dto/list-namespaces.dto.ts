import { ApiProperty, IntersectionType, OmitType, PartialType, PickType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { QueryDto } from 'src/common';
import { getSortParams } from 'src/lib/sort';

import { NamespaceDoc } from '../entities/namespace.entity';

const sortParams = getSortParams(NamespaceDoc);

export class ListNamespacesQuery extends IntersectionType(
  PartialType(PickType(NamespaceDoc, ['labels', 'key'] as const)),
  OmitType(QueryDto, ['_sort'])
) {
  /**
   * 名称 模糊查询
   */
  @IsOptional()
  @IsString()
  name_like?: string;

  /**
   * key
   */
  @IsOptional()
  @IsString({ each: true })
  @ApiProperty({ description: 'key start 查询' })
  key_start?: string | string[];

  /**
   * key
   */
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'key tree 查询' })
  key_tree?: string;

  /**
   * 父级命名空间
   */
  @IsOptional()
  @IsString({ each: true })
  @ApiProperty({ description: '所属命名空间' })
  ns?: string | string[];

  /**
   * 父级命名空间的 scope
   */
  @IsOptional()
  @IsString({ each: true })
  @ApiProperty({ description: '所属命名空间 start 查询' })
  ns_start?: string | string[];

  /**
   * 父级命名空间的 scope
   */
  @IsOptional()
  @IsString()
  @ApiProperty({ description: '所属命名空间 tree 查询' })
  ns_tree?: string;

  /**
   * 排序参数
   */
  @IsOptional()
  @IsString()
  @ApiProperty({ enum: sortParams })
  _sort?: (typeof sortParams)[number];
}
