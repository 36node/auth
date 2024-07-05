import { OmitType, PartialType } from '@nestjs/swagger';

import { CreateSmsRecordDto } from './create-sms-record.dto';

/**
 * Update smsRecord
 */

export class UpdateSmsRecordDto extends PartialType(OmitType(CreateSmsRecordDto, [] as const)) {}
