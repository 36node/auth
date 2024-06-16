import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';

import { Public } from 'src/common';

class HealthCheckResult {
  @ApiProperty({
    name: 'message',
    type: 'string',
  })
  message: string;
}

@Public()
@ApiTags('health')
@Controller('/hello')
export class HelloController {
  /**
   * health check
   */
  @ApiOperation({ operationId: 'hello' })
  @ApiOkResponse({
    description: 'A paged array of vehicles.',
    type: HealthCheckResult,
  })
  @Get()
  getHello(): HealthCheckResult {
    return { message: 'Hello World!' };
  }
}
