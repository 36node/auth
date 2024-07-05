import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SmsRecord, SmsRecordSchema } from './entities/sms-record.entity';
import { SmsRecordController } from './sms-record.controller';
import { SmsRecordService } from './sms-record.service';
import { SmsController } from './sms.controller';
import { SmsService } from './sms.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: SmsRecord.name, schema: SmsRecordSchema }])],
  controllers: [SmsController, SmsRecordController],
  providers: [SmsService, SmsRecordService],
  exports: [SmsService, SmsRecordService],
})
export class SmsModule {}
