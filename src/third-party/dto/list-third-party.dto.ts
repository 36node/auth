import { IntersectionType, OmitType, PartialType } from '@nestjs/swagger';

import { QueryDto } from 'src/common';

import { ThirdPartyDoc } from '../entities/third-party.entity';

export class ListThirdPartyQuery extends IntersectionType(
  PartialType(ThirdPartyDoc),
  OmitType(QueryDto, ['_sort'])
) {}
