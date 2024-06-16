import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from 'src/common';

import { InitService } from './init.service';

@ApiTags('init')
@Controller('init')
export class InitController {
  constructor(private readonly initService: InitService) {}

  /**
   * Init admin user and namespace
   */
  @ApiOperation({ operationId: 'init' })
  @Public()
  @ApiNoContentResponse({ description: 'No content.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post()
  async init() {
    return await this.initService.init();
  }
}
