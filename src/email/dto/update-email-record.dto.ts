import { OmitType, PartialType } from '@nestjs/swagger';

import { CreateEmailRecordDto } from './create-email-record.dto';

/**
 * Update emailRecord
 */

export class UpdateEmailRecordDto extends PartialType(
  OmitType(CreateEmailRecordDto, [] as const)
) {}
