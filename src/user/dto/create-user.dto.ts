import { OmitType } from '@nestjs/swagger';

import { UserDoc } from '../entities/user.entity';

export class CreateUserDto extends OmitType(UserDoc, [
  'lastSeenAt',
  'lastLoginIp',
  'registerIp',
  'lastLoginAt',
] as const) {}
