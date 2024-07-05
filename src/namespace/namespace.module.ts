import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Namespace, NamespaceSchema } from './entities/namespace.entity';
import { NamespaceController } from './namespace.controller';
import { NamespaceService } from './namespace.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Namespace.name, schema: NamespaceSchema }])],
  controllers: [NamespaceController],
  providers: [NamespaceService],
  exports: [NamespaceService],
})
export class NamespaceModule {}
