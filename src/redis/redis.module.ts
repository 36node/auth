import { Inject, Module } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

import { settings } from 'src/config';

@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const client = createClient({
          url: settings.redis.url,
        });
        await client.connect();
        return client;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: RedisClientType) {}

  async onModuleDestroy() {
    if (this.redis && this.redis.isOpen) {
      await this.redis.disconnect();
    }
  }
}
