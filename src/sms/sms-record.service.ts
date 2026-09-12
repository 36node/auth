import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { pick } from 'lodash';
import { DeleteResult } from 'mongodb';
import { Model } from 'mongoose';

import { buildMongooseQuery } from 'src/mongo';

import { CreateSmsRecordDto } from './dto/create-sms-record.dto';
import { ListSmsRecordsQuery } from './dto/list-sms-records.dto';
import { UpdateSmsRecordDto } from './dto/update-sms-record.dto';
import { SmsRecord, SmsRecordDocument } from './entities/sms-record.entity';

const METADATA = 'phone sign template account status sentAt createdAt updatedAt';

@Injectable()
export class SmsRecordService {
  constructor(
    @InjectModel(SmsRecord.name) private readonly smsRecordModel: Model<SmsRecordDocument>
  ) {}

  create(dto: CreateSmsRecordDto): Promise<SmsRecordDocument> {
    const createdSmsRecord = new this.smsRecordModel(
      pick(dto, ['phone', 'sign', 'template', 'account', 'status', 'sentAt'])
    );
    return createdSmsRecord.save();
  }

  count(query: ListSmsRecordsQuery): Promise<number> {
    return this.smsRecordModel.countDocuments(query).exec();
  }

  list(query: ListSmsRecordsQuery): Promise<SmsRecordDocument[]> {
    const { limit = 10, sort, offset = 0, filter } = buildMongooseQuery(query);
    return this.smsRecordModel
      .find(filter)
      .select(METADATA)
      .sort(sort)
      .skip(offset)
      .limit(limit)
      .exec();
  }

  get(id: string): Promise<SmsRecordDocument> {
    return this.smsRecordModel.findById(id).select(METADATA).exec();
  }

  update(id: string, dto: UpdateSmsRecordDto): Promise<SmsRecordDocument> {
    return this.smsRecordModel
      .findByIdAndUpdate(
        id,
        pick(dto, ['phone', 'sign', 'template', 'account', 'status', 'sentAt']),
        { new: true }
      )
      .select(METADATA)
      .exec();
  }

  delete(id: string): Promise<SmsRecordDocument> {
    return this.smsRecordModel.findByIdAndDelete(id).select(METADATA).exec();
  }

  cleanupAllData(): Promise<DeleteResult> {
    return this.smsRecordModel.deleteMany({}).exec();
  }
}
