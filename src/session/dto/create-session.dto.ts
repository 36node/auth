import { OmitType } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

import { SessionDoc } from '../entities/session.entity';

export class CreateSessionDto extends OmitType(SessionDoc, ['key', 'user'] as const) {
  /**
   * 用户 ID
   */
  @IsNotEmpty()
  @IsMongoId()
  uid: string;
}
