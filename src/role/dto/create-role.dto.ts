import { OmitType } from '@nestjs/swagger';

import { RoleDoc } from '../entities/role.entity';

export class CreateRoleDto extends OmitType(RoleDoc, ['permissions'] as const) {
  /**
   * 权限
   */
  permissions?: string[];
}
