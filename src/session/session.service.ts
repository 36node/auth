import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { nanoid } from 'nanoid';

import { buildMongooseQuery } from 'src/mongo';

import { CreateSessionDto } from './dto/create-session.dto';
import { ListSessionsQuery } from './dto/list-sessions.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { Session, SessionDocument } from './entities/session.entity';

const changeDto = (obj: CreateSessionDto | UpdateSessionDto | ListSessionsQuery) => {
  const { uid, ...rest } = obj;
  return {
    ...rest,
    ...(uid && { user: uid }),
  };
};

@Injectable()
export class SessionService {
  constructor(@InjectModel(Session.name) private readonly sessionModel: Model<SessionDocument>) {}

  create(createDto: CreateSessionDto): Promise<SessionDocument> {
    const key = nanoid();
    const session = new this.sessionModel({ ...changeDto(createDto), key });
    return session.save();
  }

  count(query: ListSessionsQuery): Promise<number> {
    const { filter } = buildMongooseQuery(changeDto(query));
    return this.sessionModel.countDocuments(filter).exec();
  }

  list(query: ListSessionsQuery): Promise<SessionDocument[]> {
    const { limit = 10, sort, offset = 0, filter } = buildMongooseQuery(changeDto(query));
    return this.sessionModel.find(filter).sort(sort).skip(offset).limit(limit).exec();
  }

  get(id: string): Promise<SessionDocument> {
    return this.sessionModel.findById(id).exec();
  }

  update(id: string, updateDto: UpdateSessionDto): Promise<SessionDocument> {
    return this.sessionModel.findByIdAndUpdate(id, changeDto(updateDto), { new: true }).exec();
  }

  upsertByKey(key: string, updateDto: UpdateSessionDto): Promise<SessionDocument> {
    return this.sessionModel
      .findOneAndUpdate({ key }, changeDto(updateDto), { upsert: true, new: true })
      .exec();
  }

  async delete(id: string): Promise<void> {
    await this.sessionModel.findByIdAndDelete(id).exec();
  }

  /**
   * 根据 key 找到 session
   *
   * @param key
   * @returns
   */
  async findByKey(key: string): Promise<SessionDocument> {
    return this.sessionModel.findOne({ key }).exec();
  }
}
