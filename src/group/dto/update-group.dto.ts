import { OmitType } from '@nestjs/swagger';

import { GroupDoc } from '../entities/group.entity';

export class UpdateGroupDto extends OmitType(GroupDoc, [] as const) {}
