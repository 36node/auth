import { Controller, Get, Header, HttpStatus, Inject, Res } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import {
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiPropertyOptional,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { Connection } from 'mongoose';

import { Public } from './auth';
import { checkMongoHealth } from './common';
import { checkRedisHealth, REDIS_CLIENT, RedisClient } from './redis';

const SERVICE_NAME = 'auth';

class HealthCheckResult {
  @ApiProperty({
    name: 'message',
    type: 'string',
  })
  message: string;
}

class HealthIndicator {
  @ApiProperty({ description: 'Whether the dependency is reachable.' })
  ok: boolean;

  @ApiPropertyOptional({
    description: 'Failure reason (present only when ok=false).',
    example: '[redis] health.ping timed out after 1500ms',
  })
  error?: string;
}

class HealthChecks {
  @ApiProperty({ description: 'Redis connectivity', type: HealthIndicator })
  redis: HealthIndicator;

  @ApiProperty({ description: 'MongoDB connectivity', type: HealthIndicator })
  mongo: HealthIndicator;
}

class HealthResult {
  @ApiProperty({
    description: 'Overall status. `ok` when every dependency is reachable, `degraded` otherwise.',
    enum: ['ok', 'degraded'],
  })
  status: 'ok' | 'degraded';

  @ApiProperty({ description: 'Service name', example: SERVICE_NAME })
  service: string;

  @ApiProperty({ description: 'ISO8601 timestamp of the check' })
  timestamp: string;

  @ApiProperty({ description: 'Per-dependency check results', type: HealthChecks })
  checks: HealthChecks;
}

@ApiTags('health')
@Controller()
export class HelloController {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: RedisClient,
    @InjectConnection() private readonly mongo: Connection
  ) {}

  /**
   * Liveness probe.
   *
   * Returns a static payload to prove the HTTP server is responsive. It
   * deliberately does **not** touch Redis, Mongo or any other dependency:
   * Kubernetes' livenessProbe failures **restart the container**, and we do
   * not want a Redis blip to trigger a restart cascade across every pod
   * (which would only stampede a recovering dependency). Dependency health
   * belongs in `/health` (readiness) below, where a 503 just pulls the pod
   * out of the Service Endpoints without restarting it.
   */
  @Public()
  @Get('/hello')
  @ApiOperation({ operationId: 'hello' })
  @ApiOkResponse({
    description: 'Process is responsive.',
    type: HealthCheckResult,
  })
  getHello(): HealthCheckResult {
    return { message: 'Hello World!' };
  }

  /**
   * Readiness probe.
   *
   * Checks every critical dependency concurrently (so total latency is
   * `max(redis, mongo)` instead of their sum). Returns 200 when everything
   * passes and 503 + `status="degraded"` when any check fails. Kubernetes
   * readinessProbe failures pull the pod out of the Service Endpoints; once
   * the dependency recovers the next probe flips the pod back in, no restart
   * required.
   *
   * `Cache-Control: no-store` is set explicitly because a stale-cached 503
   * (or 200) at any intermediate layer would defeat the purpose entirely.
   */
  @Public()
  @Get('/health')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ operationId: 'health' })
  @ApiOkResponse({
    description: 'Service and every dependency are reachable.',
    type: HealthResult,
  })
  @ApiResponse({
    status: 503,
    description: 'At least one dependency is unreachable.',
    type: HealthResult,
  })
  async getHealth(@Res({ passthrough: true }) res: Response): Promise<HealthResult> {
    const [redis, mongo] = await Promise.all([
      checkRedisHealth(this.redis),
      checkMongoHealth(this.mongo),
    ]);
    const ok = redis.ok && mongo.ok;

    res.status(ok ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE);

    return {
      status: ok ? 'ok' : 'degraded',
      service: SERVICE_NAME,
      timestamp: new Date().toISOString(),
      checks: { redis, mongo },
    };
  }
}
