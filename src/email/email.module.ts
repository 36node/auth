import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EmailRecordController } from './email-record.controller';
import { EmailRecordService } from './email-record.service';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { EmailRecord, EmailRecordSchema } from './entities/email-record.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: EmailRecord.name, schema: EmailRecordSchema }])],
  controllers: [EmailController, EmailRecordController],
  providers: [EmailService, EmailRecordService],
  exports: [EmailService, EmailRecordService],
})
export class EmailModule {}
