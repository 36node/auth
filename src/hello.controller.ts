import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';

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
