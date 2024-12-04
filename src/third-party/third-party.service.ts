import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { buildMongooseQuery } from 'src/mongo';

import { createThirdPartyDto } from './dto/create-third-party.dto';
import { ListThirdPartyDto } from './dto/list-third-party.dto';
import { UpdateThirdPartyDto } from './dto/update-third-party.dto';
import { ThirdParty, ThirdPartyDocument, ThirdPartySource } from './entities/third-party.entity';

@Injectable()
export class ThirdPartyService {
  constructor(
    @InjectModel(ThirdParty.name) private readonly thirdPartyModel: Model<ThirdPartyDocument>
  ) {}

  create(createDto: createThirdPartyDto): Promise<ThirdPartyDocument> {
    const createdThirdParty = new this.thirdPartyModel(createDto);
    return createdThirdParty.save();
  }

  count(query: ListThirdPartyDto): Promise<number> {
    const { filter } = buildMongooseQuery(query);
    return this.thirdPartyModel.countDocuments(filter).exec();
  }

  list(query: ListThirdPartyDto): Promise<ThirdPartyDocument[]> {
    const { limit = 10, sort, offset = 0, filter } = buildMongooseQuery(query);
    return this.thirdPartyModel.find(filter).sort(sort).skip(offset).limit(limit).exec();
  }

  get(id: string): Promise<ThirdPartyDocument> {
    return this.thirdPartyModel.findById(id).exec();
  }

  update(id: string, updateDto: UpdateThirdPartyDto): Promise<ThirdPartyDocument> {
    return this.thirdPartyModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  findBySource(login: string, source: ThirdPartySource) {
    return this.thirdPartyModel.findOne({ login, source }).exec();
  }

  upsert(login: string, source: ThirdPartySource, dto: createThirdPartyDto) {
    return this.thirdPartyModel
      .findOneAndUpdate({ login, source }, dto, { upsert: true, new: true })
      .exec();
  }

  findAndUpdate(login: string, source: ThirdPartySource, dto: UpdateThirdPartyDto) {
    return this.thirdPartyModel.findOneAndUpdate({ login, source }, dto, { new: true }).exec();
  }
}
