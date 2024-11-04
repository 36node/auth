import { Global, Inject, Module } from '@nestjs/common';
import { createClient, createCluster, RedisClientType } from 'redis';

import * as config from './config';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const urls = config.url.split(',');
        if (urls && urls.length > 1) {
          const cluster = createCluster({
            rootNodes: urls.map((node) => {
              return { url: node };
            }),
          });
          await cluster.connect();
          console.log(await cluster.get('test'));
          return cluster;
        } else if (urls && urls.length > 0) {
          const client = createClient({
            url: config.url,
          });

          await client.connect();
          console.log(await client.get('test'));
          return client;
        }
        throw new Error('Redis url error, url=' + config.url);
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
