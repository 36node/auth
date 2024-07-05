import { OmitType } from '@nestjs/swagger';

import { EmailRecordDoc } from '../entities/email-record.entity';

export class CreateEmailRecordDto extends OmitType(EmailRecordDoc, [] as const) {}
