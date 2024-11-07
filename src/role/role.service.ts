import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult } from 'mongodb';
import { isObjectIdOrHexString, Model } from 'mongoose';

import { buildMongooseQuery } from 'src/mongo';

import { CreateRoleDto } from './dto/create-role.dto';
import { ListRolesQuery } from './dto/list-roles.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpsertRoleDto } from './dto/upsert-role.dto';
import { Role, RoleDocument } from './entities/role.entity';

@Injectable()
export class RoleService {
  constructor(@InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>) {}

  create(createDto: CreateRoleDto) {
    const createdRole = new this.roleModel(createDto);
    return createdRole.save();
  }

  count(query: ListRolesQuery = {}): Promise<number> {
    const { filter } = buildMongooseQuery(query);
    return this.roleModel.countDocuments(filter).exec();
  }

  list(query: ListRolesQuery = {}): Promise<RoleDocument[]> {
    const { limit = 10, sort, offset = 0, filter } = buildMongooseQuery(query);
    return this.roleModel.find(filter).sort(sort).skip(offset).limit(limit).exec();
  }

  get(idOrKey: string): Promise<RoleDocument> {
    if (isObjectIdOrHexString(idOrKey)) {
      return this.roleModel.findById(idOrKey).exec();
    }
    return this.getByKey(idOrKey);
  }

  update(id: string, updateDto: UpdateRoleDto): Promise<RoleDocument> {
    return this.roleModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  upsertByKey(key: string, dto: UpsertRoleDto) {
    const filter = { key };
    return this.roleModel.findOneAndUpdate(filter, dto, { upsert: true, new: true }).exec();
  }

  delete(id: string) {
    return this.roleModel.findByIdAndDelete(id).exec();
  }

  getByKey(key: string): Promise<RoleDocument> {
    return this.roleModel.findOne({ key }).exec();
  }

  cleanupAllData(): Promise<DeleteResult> {
    return this.roleModel.deleteMany({}).exec();
  }
}
