import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import Debug from 'debug';

import { defaultUser } from 'src/config';
import { NamespaceModule } from 'src/namespace';

import { User, UserSchema } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const debug = Debug('app:user:module');

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), NamespaceModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {
  constructor(private readonly userService: UserService) {}

  async onModuleInit() {
    // 初始化用户
    const user = await this.userService.findOne({ username: defaultUser.username });
    if (!user) {
      await this.userService.upsertByUsername(defaultUser.username, defaultUser);
      debug(`default user ${defaultUser.username} created.`);
    }
  }
}
