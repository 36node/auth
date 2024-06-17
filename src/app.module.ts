import fs from 'fs';

import { BullModule } from '@nestjs/bull';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { redisStore } from 'cache-manager-redis-yet';
import { RedisClientOptions } from 'redis';

import { AccessControlGuard, AccessControlModule } from './access-control';
import { AuthModule, JwtAuthGuard } from './auth';
import { BaseDataModule } from './base-data';
import { CaptchaModule } from './captcha';
import { RouteLoggerMiddleware } from './common/route-logger.middleware';
import { settings } from './config';
import { EmailModule } from './email';
import { HelloController } from './hello.controller';
import { InitModule } from './init';
import { MeModule } from './me';
import { NamespaceModule } from './namespace';
import { RedisModule } from './redis';
import { SessionModule } from './session';
import { UserModule } from './user';

@Module({
  imports: [
    MongooseModule.forRoot(settings.mongo.url),
    BullModule.forRoot({
      redis: settings.redis.url,
    }),
    CacheModule.register<RedisClientOptions>({
      isGlobal: true,
      store: redisStore,
      // Store-specific configuration:
      url: settings.redis.url,
      database: 8,
    }),
    JwtModule.register({
      global: true,
      privateKey: fs.readFileSync('ssl/private.key', 'utf-8'),
      signOptions: {
        allowInsecureKeySizes: true,
        algorithm: 'RS256',
        expiresIn: '60d',
      },
    }),
    AccessControlModule,
    AuthModule,
    EventEmitterModule.forRoot(),
    EmailModule,
    RedisModule,
    CaptchaModule,
    SessionModule,
    NamespaceModule,
    BaseDataModule,
    UserModule,
    InitModule,
    MeModule,
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
