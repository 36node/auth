import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { buildMongooseQuery } from 'src/mongo';

import { CreateEmailRecordDto } from './dto/create-email-record.dto';
import { ListEmailRecordsQuery } from './dto/list-email-records.dto';
import { UpdateEmailRecordDto } from './dto/update-email-record.dto';
import { EmailRecord, EmailRecordDocument } from './entities/email-record.entity';

@Injectable()
export class EmailRecordService {
  constructor(
    @InjectModel(EmailRecord.name) private readonly emailRecordModel: Model<EmailRecordDocument>
  ) {}

  create(dto: CreateEmailRecordDto): Promise<EmailRecordDocument> {
    const createdEmailRecord = new this.emailRecordModel(dto);
    return createdEmailRecord.save();
  }

  count(query: ListEmailRecordsQuery): Promise<number> {
    return this.emailRecordModel.countDocuments(query).exec();
  }

  list(query: ListEmailRecordsQuery): Promise<EmailRecordDocument[]> {
    const { limit = 10, sort, offset = 0, filter } = buildMongooseQuery(query);
    return this.emailRecordModel.find(filter).sort(sort).skip(offset).limit(limit).exec();
  }

  get(id: string): Promise<EmailRecordDocument> {
    return this.emailRecordModel.findById(id).exec();
  }

  update(id: string, dto: UpdateEmailRecordDto): Promise<EmailRecordDocument> {
    return this.emailRecordModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  delete(id: string): Promise<EmailRecordDocument> {
    return this.emailRecordModel.findByIdAndDelete(id).exec();
  }
}
