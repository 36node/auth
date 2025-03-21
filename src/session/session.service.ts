import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult } from 'mongodb';
import { Model } from 'mongoose';
import { nanoid } from 'nanoid';

import { buildMongooseQuery } from 'src/mongo';

import { CreateSessionDto } from './dto/create-session.dto';
import { ListSessionsQuery } from './dto/list-sessions.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { Session, SessionDocument } from './entities/session.entity';

@Injectable()
export class SessionService {
  constructor(@InjectModel(Session.name) private readonly sessionModel: Model<SessionDocument>) {}

  create(createDto: CreateSessionDto): Promise<SessionDocument> {
    const refreshToken = nanoid();
    const session = new this.sessionModel({ ...createDto, refreshToken });
    return session.save();
  }

  count(query: ListSessionsQuery): Promise<number> {
    const { filter } = buildMongooseQuery(query);
    return this.sessionModel.countDocuments(filter).exec();
  }

  list(query: ListSessionsQuery): Promise<SessionDocument[]> {
    const { limit = 10, sort, offset = 0, filter } = buildMongooseQuery(query);
    return this.sessionModel.find(filter).sort(sort).skip(offset).limit(limit).exec();
  }

  get(id: string): Promise<SessionDocument> {
    return this.sessionModel.findById(id).exec();
  }

  update(id: string, updateDto: UpdateSessionDto): Promise<SessionDocument> {
    return this.sessionModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  upsertByRefreshToken(
    refreshToken: string,
    updateDto: UpdateSessionDto
  ): Promise<SessionDocument> {
    return this.sessionModel
      .findOneAndUpdate({ refreshToken }, updateDto, { upsert: true, new: true })
      .exec();
  }

  async delete(id: string): Promise<void> {
    await this.sessionModel.findByIdAndDelete(id).exec();
  }

  async deleteByRefreshToken(refreshToken: string): Promise<void> {
    await this.sessionModel.deleteOne({ refreshToken }).exec();
  }

  /**
   * 根据 refreshToken 找到 session
   *
   * @param refreshToken
   * @returns
   */
  async findByRefreshToken(refreshToken: string): Promise<SessionDocument> {
    return this.sessionModel.findOne({ refreshToken }).exec();
  }

  cleanupAllData(): Promise<DeleteResult> {
    return this.sessionModel.deleteMany({}).exec();
  }
}
