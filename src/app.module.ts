import { BullModule } from '@nestjs/bull';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { redisStore } from 'cache-manager-redis-yet';
import { RedisClientOptions } from 'redis';

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
    MongooseModule.forRoot(mongo.url),
    BullModule.forRoot({
      redis: redis.url,
    }),
    CacheModule.register<RedisClientOptions>({
      isGlobal: true,
      store: redisStore,
      // Store-specific configuration:
      url: redis.url,
      database: 8,
    }),
    EventEmitterModule.forRoot(),
    AuthModule,
    CaptchaModule,
    EmailModule,
    IndustryModule,
    NamespaceModule,
    GroupModule,
    RedisModule,
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

  async onModuleDestroy() {
    await this.cacheManager.store.client?.disconnect();
  }
}
