import { IntersectionType, OmitType, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { QueryDto } from 'src/common';
import { ApiStringOrArray } from 'src/common/decorator';

import { ThirdPartyDoc } from '../entities/third-party.entity';

export class ListThirdPartyQuery extends IntersectionType(
  PartialType(OmitType(ThirdPartyDoc, ['tid'])),
  OmitType(QueryDto, ['_sort'])
) {
  /**
   * 按 tid 筛选，支持多个值
   */
  @IsOptional()
  @IsString({ each: true })
  @ApiStringOrArray('按 tid 单个或者数组查询')
  tid?: string | string[];
}
