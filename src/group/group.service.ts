import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult } from 'mongodb';
import { isObjectIdOrHexString, Model } from 'mongoose';

import { buildMongooseQuery } from 'src/mongo';

import { CreateGroupDto } from './dto/create-group.dto';
import { ListGroupsQuery } from './dto/list-groups.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { UpsertGroupDto } from './dto/upsert-group.dto';
import { Group, GroupDocument } from './entities/group.entity';

@Injectable()
export class GroupService {
  constructor(@InjectModel(Group.name) private readonly groupModel: Model<GroupDocument>) {}

  create(createDto: CreateGroupDto) {
    const createdGroup = new this.groupModel(createDto);
    return createdGroup.save();
  }

  count(query: ListGroupsQuery = {}): Promise<number> {
    const { filter } = buildMongooseQuery(query);
    return this.groupModel.countDocuments(filter).exec();
  }

  list(query: ListGroupsQuery = {}): Promise<GroupDocument[]> {
    const { limit = 10, sort, offset = 0, filter } = buildMongooseQuery(query);
    return this.groupModel.find(filter).sort(sort).skip(offset).limit(limit).exec();
  }

  get(idOrName: string): Promise<GroupDocument> {
    if (isObjectIdOrHexString(idOrName)) {
      return this.groupModel.findById(idOrName).exec();
    }
    return this.getByName(idOrName);
  }

  update(id: string, updateDto: UpdateGroupDto): Promise<GroupDocument> {
    return this.groupModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  upsertByName(name: string, dto: UpsertGroupDto) {
    const filter = { name };
    return this.groupModel.findOneAndUpdate(filter, dto, { upsert: true, new: true }).exec();
  }

  delete(id: string) {
    return this.groupModel.findByIdAndDelete(id).exec();
  }

  getByName(name: string): Promise<GroupDocument> {
    return this.groupModel.findOne({ name }).exec();
  }

  cleanupAllData(): Promise<DeleteResult> {
    return this.groupModel.deleteMany({}).exec();
  }
}
