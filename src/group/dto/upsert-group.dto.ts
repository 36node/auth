import { OmitType } from '@nestjs/swagger';

import { CreateGroupDto } from './create-group.dto';

export class UpsertGroupDto extends OmitType(CreateGroupDto, [] as const) {}
