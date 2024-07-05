import { OmitType, PartialType } from '@nestjs/swagger';

import { UserDoc } from '../entities/user.entity';

export class UpdateUserDto extends OmitType(PartialType(UserDoc), ['password'] as const) {}
