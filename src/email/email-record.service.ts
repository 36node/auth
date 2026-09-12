import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { pick } from 'lodash';
import { DeleteResult } from 'mongodb';
import { Model } from 'mongoose';

import { buildMongooseQuery } from 'src/mongo';

import { CreateEmailRecordDto } from './dto/create-email-record.dto';
import { ListEmailRecordsQuery } from './dto/list-email-records.dto';
import { UpdateEmailRecordDto } from './dto/update-email-record.dto';
import { EmailRecord, EmailRecordDocument } from './entities/email-record.entity';

const METADATA = 'from to status sentAt createdAt updatedAt';

@Injectable()
export class EmailRecordService {
  constructor(
    @InjectModel(EmailRecord.name) private readonly emailRecordModel: Model<EmailRecordDocument>
  ) {}

  create(dto: CreateEmailRecordDto): Promise<EmailRecordDocument> {
    const createdEmailRecord = new this.emailRecordModel(
      pick(dto, ['from', 'to', 'status', 'sentAt'])
    );
    return createdEmailRecord.save();
  }

  count(query: ListEmailRecordsQuery): Promise<number> {
    return this.emailRecordModel.countDocuments(query).exec();
  }

  list(query: ListEmailRecordsQuery): Promise<EmailRecordDocument[]> {
    const { limit = 10, sort, offset = 0, filter } = buildMongooseQuery(query);
    return this.emailRecordModel
      .find(filter)
      .select(METADATA)
      .sort(sort)
      .skip(offset)
      .limit(limit)
      .exec();
  }

  get(id: string): Promise<EmailRecordDocument> {
    return this.emailRecordModel.findById(id).select(METADATA).exec();
  }

  update(id: string, dto: UpdateEmailRecordDto): Promise<EmailRecordDocument> {
    return this.emailRecordModel
      .findByIdAndUpdate(id, pick(dto, ['from', 'to', 'status', 'sentAt']), { new: true })
      .select(METADATA)
      .exec();
  }

  delete(id: string): Promise<EmailRecordDocument> {
    return this.emailRecordModel.findByIdAndDelete(id).select(METADATA).exec();
  }

  cleanupAllData(): Promise<DeleteResult> {
    return this.emailRecordModel.deleteMany({}).exec();
  }
}
