import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Region } from './entities/region.entity';
import { RegionService } from './region.service';

@ApiTags('region')
@Controller('regions')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  /**
   * List Regions
   */
  @ApiOperation({ operationId: 'listRegions' })
  @ApiOkResponse({
    description: 'A paged array of region.',
    type: [Region],
  })
  @Get()
  listRegions() {
    return this.regionService.listRegions();
  }
}
