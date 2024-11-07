import { OmitType } from '@nestjs/swagger';

import { CreateRoleDto } from './create-role.dto';

export class UpsertRoleDto extends OmitType(CreateRoleDto, [] as const) {}
