import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NamespaceModule } from 'src/namespace';

import { Group, GroupSchema } from './entities/group.entity';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Group.name, schema: GroupSchema }]),
    NamespaceModule,
  ],
  controllers: [GroupController],
  providers: [GroupService],
  exports: [GroupService],
})
export class GroupModule {}
