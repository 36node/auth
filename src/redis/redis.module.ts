import { Global, Inject, Module } from '@nestjs/common';

import * as config from 'src/config';

import { createRedisClient, RedisClient } from './client';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => createRedisClient(config.redis.url),
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: RedisClient) {}

  async onModuleDestroy() {
    // Standalone clients expose `isOpen`; clusters always expose it too. Use
    // optional chaining defensively in case the underlying impl changes.
    if ((this.redis as { isOpen?: boolean }).isOpen) {
      await this.redis.disconnect();
    }
  }
}
