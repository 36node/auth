import { OmitType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { UserDoc } from '../entities/user.entity';

export class CreateUserDto extends OmitType(UserDoc, [
  'labels',
  'lastSeenAt',
  'lastLoginIp',
  'lastLoginAt',
  'registerIp',
] as const) {
  /**
   * 标签
   */
  @IsOptional()
  @IsString({ each: true })
  labels?: string[];
}
