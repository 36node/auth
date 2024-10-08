import { OmitType, PartialType } from '@nestjs/swagger';

import { GroupDoc } from '../entities/group.entity';

export class UpdateGroupDto extends PartialType(OmitType(GroupDoc, [] as const)) {}
