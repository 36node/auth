import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isObjectIdOrHexString, Model } from 'mongoose';

import { errCodes } from 'src/common';
import { settings } from 'src/config';
import { buildMongooseQuery } from 'src/lib/mongoose-helper';

import { CreateNamespaceDto } from './dto/create-namespace.dto';
import { ListNamespaceQuery } from './dto/list-namespace.dto';
import { UpdateNamespaceDto } from './dto/update-namespace.dto';
import { Namespace, NamespaceDocument } from './entities/namespace.entity';

@Injectable()
export class NamespaceService {
  private readonly passwordRegExp: RegExp;
  constructor(
    @InjectModel(Namespace.name) private readonly namespaceModel: Model<NamespaceDocument>
  ) {
    this.passwordRegExp = new RegExp(settings.passwordRegExpString);
  }

  create(createDto: CreateNamespaceDto) {
    const createdNamespace = new this.namespaceModel(createDto);
    return createdNamespace.save();
  }

  count(query: ListNamespaceQuery): Promise<number> {
    const { filter } = buildMongooseQuery(query);
    return this.namespaceModel.countDocuments(filter).exec();
  }

  list(query: ListNamespaceQuery): Promise<NamespaceDocument[]> {
    const { limit = 10, sort, offset = 0, filter } = buildMongooseQuery(query);
    return this.namespaceModel.find(filter).sort(sort).skip(offset).limit(limit).exec();
  }

  get(idOrNs: string): Promise<NamespaceDocument> {
    if (isObjectIdOrHexString(idOrNs)) {
      return this.namespaceModel.findOne({ _id: idOrNs }).exec();
    }
    return this.getByFullPath(idOrNs);
  }

  update(id: string, updateDto: UpdateNamespaceDto): Promise<NamespaceDocument> {
    return this.namespaceModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  upsert(namespace: CreateNamespaceDto) {
    const filter = { key: namespace.key };
    if (namespace.parent) {
      filter['parent'] = namespace.parent;
    }
    return this.namespaceModel
      .findOneAndUpdate(filter, namespace, { upsert: true, new: true })
      .exec();
  }

  delete(id: string) {
    return this.namespaceModel.findByIdAndDelete(id).exec();
  }

  getByFullPath(path: string): Promise<NamespaceDocument> {
    let ns = path;
    let parent = null;
    const index = path.lastIndexOf('/');
    if (index >= 0) {
      parent = path.substring(0, index);
      ns = path.substring(index + 1);
    }
    return this.namespaceModel.findOne({ key: ns, parent }).exec();
  }

  passwordValidate(password: string, regExpStr?: string, field?: string) {
    let regexp: RegExp;
    if (regExpStr) {
      regexp = new RegExp(regExpStr);
    } else {
      regexp = this.passwordRegExp;
    }

    if (!regexp.test(password)) {
      throw new BadRequestException({
        code: errCodes.WEAK_PASSWORD,
        message: 'Password do not match the regex',
        details: [
          {
            message: `Password do not match the regex`,
            field: field || 'password',
          },
        ],
      });
    }
  }
}
