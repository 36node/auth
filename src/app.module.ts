import { BullModule } from '@nestjs/bull';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { redisClusterInsStore, redisInsStore } from 'cache-manager-redis-yet';

import { AuthModule } from './auth';
import { CaptchaModule } from './captcha';
import { RouteLoggerMiddleware } from './common/route-logger.middleware';
import { EmailModule } from './email';
import { GroupModule } from './group';
import { HelloController } from './hello.controller';
import { IndustryModule } from './industry';
import { config as mongo } from './mongo';
import { NamespaceModule } from './namespace';
import { config as redis, RedisModule } from './redis';
import { RegionModule } from './region';
import { SessionModule } from './session';
import { SmsModule } from './sms';
import { UserModule } from './user';

@Module({
  imports: [
    RedisModule,
    MongooseModule.forRoot(mongo.url),
    BullModule.forRoot({
      redis: redis.url,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (client) => {
        return {
          store: () => {
            if (client.rootNodes && client.rootNodes.length) {
              return redisClusterInsStore(client, { rootNodes: client.rootNodes });
            } else {
              return redisInsStore(client);
            }
          },
        };
      },
      inject: ['REDIS_CLIENT'], // 注入 Redis 客户端
    }),
    EventEmitterModule.forRoot(),
    AuthModule,
    CaptchaModule,
    EmailModule,
    IndustryModule,
    NamespaceModule,
    GroupModule,

    RegionModule,
    SessionModule,
    SmsModule,
    UserModule,
  ],
  controllers: [HelloController],
  providers: [],
})
export class AppModule implements NestModule {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: any) {}

  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RouteLoggerMiddleware).exclude('/hello').forRoutes('*');
  }

  async onModuleDestroy() {}
}
