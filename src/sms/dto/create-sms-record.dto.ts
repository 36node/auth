import { OmitType } from '@nestjs/swagger';

import { SmsRecordDoc } from '../entities/sms-record.entity';

export class CreateSmsRecordDto extends OmitType(SmsRecordDoc, [] as const) {}
