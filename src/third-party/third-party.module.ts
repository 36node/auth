import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserModule } from 'src/user';

import { ThirdParty, ThirdPartySchema } from './entities/third-party.entity';
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
export class ThirdPartyModule {}
