import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { UserDoc } from '../entities/user.entity';

export class CreateUserDto extends OmitType(UserDoc, [
  'groups',
  'labels',
  'lastSeenAt',
  'lastLoginIp',
  'lastLoginAt',
  'permissions',
  'roles',
] as const) {
  /**
   * 显式指定用户 id，用于导入场景
   */
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: '显式指定用户 id，用于导入场景' })
  id?: string;

  /**
   * 团队
   */
  @IsOptional()
  @IsString({ each: true })
  groups?: string[];

  /**
   * 标签
   */
  @IsOptional()
  @IsString({ each: true })
  labels?: string[];

  /**
   * 权限
   */
  @IsOptional()
  @IsString({ each: true })
  permissions?: string[];

  /**
   * 角色
   */
  @IsOptional()
  @IsString({ each: true })
  roles?: string[];
}
