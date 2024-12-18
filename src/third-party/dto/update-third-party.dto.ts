import { PartialType } from '@nestjs/swagger';

import { ThirdPartyDoc } from '../entities/third-party.entity';

export class UpdateThirdPartyDto extends PartialType(ThirdPartyDoc) {}
