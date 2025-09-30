import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult } from 'mongodb';
import { Model } from 'mongoose';

import { buildMongooseQuery } from 'src/mongo';

import { CreateNamespaceDto } from './dto/create-namespace.dto';
import { ListNamespacesQuery } from './dto/list-namespaces.dto';
import { UpdateNamespaceDto } from './dto/update-namespace.dto';
import { UpsertNamespaceDto } from './dto/upsert-namespace.dto';
import { Namespace, NamespaceDocument } from './entities/namespace.entity';

@Injectable()
export class NamespaceService {
  private readonly passwordRegExp: RegExp;
  constructor(
    @InjectModel(Namespace.name) private readonly namespaceModel: Model<NamespaceDocument>
  ) {}

  create(createDto: CreateNamespaceDto) {
    const createdNamespace = new this.namespaceModel(createDto);
    return createdNamespace.save();
  }

  count(query: ListNamespacesQuery = {}): Promise<number> {
    const { filter } = buildMongooseQuery(query);
    return this.namespaceModel.countDocuments(filter).exec();
  }

  list(query: ListNamespacesQuery = {}): Promise<NamespaceDocument[]> {
    const { limit = 10, sort, offset = 0, filter } = buildMongooseQuery(query);
    return this.namespaceModel.find(filter).sort(sort).skip(offset).limit(limit).exec();
  }

  update(key: string, updateDto: UpdateNamespaceDto): Promise<NamespaceDocument> {
    return this.namespaceModel.findOneAndUpdate({ key }, updateDto, { new: true }).exec();
  }

  upsertByKey(key: string, dto: UpsertNamespaceDto): Promise<NamespaceDocument> {
    const filter = { key };
    return this.namespaceModel.findOneAndUpdate(filter, dto, { upsert: true, new: true }).exec();
  }

  delete(key: string): Promise<NamespaceDocument> {
    return this.namespaceModel.findOneAndDelete({ key }).exec();
  }

  get(key: string): Promise<NamespaceDocument | null> {
    return this.namespaceModel.findOne({ key }).exec();
  }

  cleanupAllData(): Promise<DeleteResult> {
    return this.namespaceModel.deleteMany({}).exec();
  }
}
