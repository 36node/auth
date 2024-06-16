import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NamespaceModule } from 'src/namespace';

import { User, UserSchema } from './entities/user.entity';
import { LoadUserMiddleware } from './user-load.middleware';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { VerifyIdentityService } from './verify-identity.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), NamespaceModule],
  controllers: [UserController],
  providers: [UserService, VerifyIdentityService],
  exports: [UserService, VerifyIdentityService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(LoadUserMiddleware)
      .forRoutes({ path: '*users/:userId', method: RequestMethod.ALL });
  }
}
