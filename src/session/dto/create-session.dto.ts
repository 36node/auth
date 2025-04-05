import { OmitType } from '@nestjs/swagger';

import { SessionDoc } from '../entities/session.entity';

export class CreateSessionDto extends OmitType(SessionDoc, ['key'] as const) {}
