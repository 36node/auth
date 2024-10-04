import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsMongoId, IsOptional, IsString } from 'class-validator';

import { QueryDto } from 'src/common';
import { getSortParams } from 'src/lib/sort';

import { UserDoc } from '../entities/user.entity';

import { UpdateUserDto } from './update-user.dto';

const sortParams = getSortParams(UserDoc);

export class ListUsersQuery extends IntersectionType(
  PickType(UpdateUserDto, [
    'username',
    'email',
    'phone',
    'registerRegion',
    'roles',
    'status',
  ] as const),
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
   * 用户名 模糊查询
   */
  @IsOptional()
  @IsString()
  username_like?: string;

  /**
   * 昵称 模糊查询
   */
  @IsOptional()
  @IsString()
  nickname_like?: string;

  /**
   * 所属命名空间的 ns 本级查询
   */
  @IsOptional()
  @IsString({ each: true })
  ns?: string[];

  /**
   * 所属命名空间的前缀匹配查询
   */
  @IsOptional()
  @IsString({ each: true })
  ns_start?: string[];

  /**
   * 过期时间大于该时间
   */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expireAt_gt?: Date;

  /**
   * 过期时间小于该时间
   */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expireAt_lt?: Date;

  /**
   * 排序参数
   */
  @IsOptional()
  @IsString()
  @ApiProperty({ enum: sortParams })
  _sort?: (typeof sortParams)[number];
}
