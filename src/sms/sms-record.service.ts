import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult } from 'mongodb';
import { Model } from 'mongoose';

import { buildMongooseQuery } from 'src/mongo';

import { CreateSmsRecordDto } from './dto/create-sms-record.dto';
import { ListSmsRecordsQuery } from './dto/list-sms-records.dto';
import { UpdateSmsRecordDto } from './dto/update-sms-record.dto';
import { SmsRecord, SmsRecordDocument } from './entities/sms-record.entity';

@Injectable()
export class SmsRecordService {
  constructor(
    @InjectModel(SmsRecord.name) private readonly smsRecordModel: Model<SmsRecordDocument>
  ) {}

  create(dto: CreateSmsRecordDto): Promise<SmsRecordDocument> {
    const createdSmsRecord = new this.smsRecordModel(dto);
    return createdSmsRecord.save();
  }

  count(query: ListSmsRecordsQuery): Promise<number> {
    return this.smsRecordModel.countDocuments(query).exec();
  }

  list(query: ListSmsRecordsQuery): Promise<SmsRecordDocument[]> {
    const { limit = 10, sort, offset = 0, filter } = buildMongooseQuery(query);
    return this.smsRecordModel.find(filter).sort(sort).skip(offset).limit(limit).exec();
  }

  get(id: string): Promise<SmsRecordDocument> {
    return this.smsRecordModel.findById(id).exec();
  }

  update(id: string, dto: UpdateSmsRecordDto): Promise<SmsRecordDocument> {
    return this.smsRecordModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  delete(id: string): Promise<SmsRecordDocument> {
    return this.smsRecordModel.findByIdAndDelete(id).exec();
  }

  cleanupAllData(): Promise<DeleteResult> {
    return this.smsRecordModel.deleteMany({}).exec();
  }
}
