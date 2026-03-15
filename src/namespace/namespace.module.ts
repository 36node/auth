import { Module, OnModuleInit } from '@nestjs/common';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Namespace, NamespaceDocument, NamespaceSchema } from './entities/namespace.entity';
import { NamespaceController } from './namespace.controller';
import { NamespaceService } from './namespace.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Namespace.name, schema: NamespaceSchema }])],
  controllers: [NamespaceController],
  providers: [NamespaceService],
  exports: [NamespaceService],
})
export class NamespaceModule implements OnModuleInit {
  constructor(
    @InjectModel(Namespace.name) private readonly namespaceModel: Model<NamespaceDocument>
  ) {}

  async onModuleInit() {
    await this.namespaceModel.syncIndexes();
  }
}
