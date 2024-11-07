import { OmitType, PartialType } from '@nestjs/swagger';

import { RoleDoc } from '../entities/role.entity';

export class UpdateRoleDto extends PartialType(OmitType(RoleDoc, ['key'] as const)) {}
