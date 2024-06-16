import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public, Region } from 'src/common';

import { BaseDataService } from './base-data.service';

@ApiTags('base-data')
@Controller('base-data')
export class BaseDataController {
  constructor(private readonly baseDataService: BaseDataService) {}

  /**
   * List Regions
   */
  @ApiOperation({ operationId: 'listRegions' })
  @ApiOkResponse({
    description: 'A paged array of region.',
    type: [Region],
  })
  @Get('regions')
  @Public()
  listRegions() {
    return this.baseDataService.listRegions();
  }
}
