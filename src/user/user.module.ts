import { Module, OnModuleInit } from '@nestjs/common';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import Debug from 'debug';
import { Model } from 'mongoose';

import { defaultUser } from 'src/config';
import { NamespaceModule } from 'src/namespace';

import { User, UserDocument, UserSchema } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const debug = Debug('app:user:module');

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), NamespaceModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule implements OnModuleInit {
  constructor(
    private readonly userService: UserService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>
  ) {}

  async onModuleInit() {
    await this.userModel.syncIndexes();

    // 初始化用户
    const user = await this.userService.findOne({ username: defaultUser.username });
    if (!user) {
      await this.userService.upsertByUsername(defaultUser.username, defaultUser);
      debug(`default user ${defaultUser.username} created.`);
    }
  }
}
