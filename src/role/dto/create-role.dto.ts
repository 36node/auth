import { OmitType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { RoleDoc } from '../entities/role.entity';

export class CreateRoleDto extends OmitType(RoleDoc, ['permissions'] as const) {
  /**
   * 权限
   */
  @IsOptional()
  permissions?: string[];
}
