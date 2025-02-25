import { BullModule } from '@nestjs/bull';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { Cache } from 'cache-manager';
import { redisClusterInsStore, redisInsStore } from 'cache-manager-redis-yet';

import * as config from 'src/config';

import { AppController } from './app.controller';
import { ApiKeyAuthGuard, AuthModule } from './auth';
import { CaptchaModule } from './captcha';
import { RouteLoggerMiddleware } from './common/route-logger.middleware';
import { EmailModule } from './email';
import { GroupModule } from './group';
import { HelloController } from './hello.controller';
import { IndustryModule } from './industry';
import { NamespaceModule } from './namespace';
import { RedisModule } from './redis';
import { RegionModule } from './region';
import { RoleModule } from './role';
import { SessionModule } from './session';
import { SmsModule } from './sms';
import { ThirdPartyModule } from './third-party';
import { UserModule } from './user';

@Module({
  imports: [
    RedisModule,
    MongooseModule.forRoot(config.mongo.url),
    BullModule.forRoot({
      redis: config.redis.url,
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
    ThirdPartyModule,
    RegionModule,
    SessionModule,
    SmsModule,
    UserModule,
    RoleModule,
  ],
  controllers: [HelloController, AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ApiKeyAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RouteLoggerMiddleware).exclude('/hello').forRoutes('*');
  }
}
