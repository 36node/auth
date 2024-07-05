import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NamespaceModule } from 'src/namespace';

import { User, UserSchema } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), NamespaceModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
