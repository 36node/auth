import { OmitType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { SessionDoc } from '../entities/session.entity';

export class CreateSessionDto extends OmitType(SessionDoc, ['key'] as const) {
  @IsOptional()
  @IsString()
  key?: string;
}
