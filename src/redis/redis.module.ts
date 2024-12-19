import { Global, Inject, Module } from '@nestjs/common';
import { createClient, createCluster, RedisClientType } from 'redis';

import * as config from 'src/constants';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const urls = config.redis.url.split(',');
        if (urls && urls.length > 1) {
          const cluster = createCluster({
            rootNodes: urls.map((node) => {
              return { url: node };
            }),
          });
          await cluster.connect();
          return cluster;
        } else if (urls && urls.length > 0) {
          const client = createClient({
            url: config.redis.url,
          });

          await client.connect();
          return client;
        }
        throw new Error('Redis url error, url=' + config.redis.url);
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
