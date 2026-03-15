import { Module, OnModuleInit } from '@nestjs/common';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UserModule } from 'src/user';

import { ThirdParty, ThirdPartyDocument, ThirdPartySchema } from './entities/third-party.entity';
import { ThirdPartyController } from './third-party.controller';
import { ThirdPartyService } from './third-party.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ThirdParty.name, schema: ThirdPartySchema }]),
    UserModule,
  ],
  controllers: [ThirdPartyController],
  providers: [ThirdPartyService],
  exports: [ThirdPartyService],
})
export class ThirdPartyModule implements OnModuleInit {
  constructor(
    @InjectModel(ThirdParty.name) private readonly thirdPartyModel: Model<ThirdPartyDocument>
  ) {}

  async onModuleInit() {
    await this.thirdPartyModel.syncIndexes();
  }
}
