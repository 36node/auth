import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ListIndustriesQuery } from './dto/list-industries.dto';
import { Industry } from './entities/industry.entity';
import { IndustryService } from './industry.service';

@ApiTags('industry')
@Controller('industries')
export class IndustryController {
  constructor(private readonly industryService: IndustryService) {}

  /**
   * List Industries
   */
  @ApiOperation({ operationId: 'listIndustries' })
  @ApiOkResponse({
    description: 'A paged array of region.',
    type: [Industry],
  })
  @Get()
  list(@Query() query: ListIndustriesQuery) {
    return this.industryService.list(query);
  }
}
