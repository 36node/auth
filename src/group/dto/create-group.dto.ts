import { OmitType } from '@nestjs/swagger';

import { GroupDoc } from '../entities/group.entity';

export class CreateGroupDto extends OmitType(GroupDoc, [] as const) {}
