import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';

import { Public } from './auth';

class HealthCheckResult {
  @ApiProperty({
    name: 'message',
    type: 'string',
  })
  message: string;
}

@ApiTags('health')
@Controller('/hello')
export class HelloController {
  /**
   * health check
   */
  @Public()
  @ApiOperation({ operationId: 'hello' })
  @ApiOkResponse({
    description: 'Hello!',
    type: HealthCheckResult,
  })
  @Get()
  getHello(): HealthCheckResult {
    return { message: 'Hello World!' };
  }
}
