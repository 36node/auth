import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isEmail } from 'class-validator';
import Debug from 'debug';
import { Model } from 'mongoose';

import { isUserName } from 'src/common/validate';
import { countTailZero, isNumber } from 'src/lib/lang/number';
import { getScope } from 'src/lib/lang/string';
import { buildMongooseQuery } from 'src/lib/mongoose-helper';

import { CreateUserDto } from './dto/create-user.dto';
import { ListUserQuery } from './dto/list-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Identity, User, UserDocument, UserHiddenField } from './entities/user.entity';

const debug = Debug('auth:user:service');

function wrapFilter(filter: any) {
  if (filter.registerRegion && isNumber(filter.registerRegion)) {
    const c = countTailZero(Number(filter.registerRegion));
    if (c > 0) {
      filter.registerRegion = {
        $gte: filter.registerRegion,
        $lt: String(Number(filter.registerRegion) + 10 ** c),
      };
    }
  }
  return filter;
}

function changeDto(dto: CreateUserDto | UpdateUserDto) {
  const { ns } = dto;
  const scope = ns ? getScope(ns) : '';

  return { ...dto, ...(ns && { ns }), ...(scope && { scope }) };
}

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  create(createDto: CreateUserDto) {
    debug('create user with %o', createDto);
    const createdUser = new this.userModel(changeDto(createDto));
    return createdUser.save();
  }

  count(query: ListUserQuery): Promise<number> {
    const { filter } = buildMongooseQuery(query);
    return this.userModel.countDocuments(wrapFilter(filter)).exec();
  }

  list(query: ListUserQuery): Promise<UserDocument[]> {
    const { limit = 10, sort, offset = 0, filter } = buildMongooseQuery(query);
    return this.userModel.find(wrapFilter(filter)).sort(sort).skip(offset).limit(limit).exec();
  }

  get(id: string, select: Partial<Record<UserHiddenField, boolean>> = {}): Promise<UserDocument> {
    const query = this.userModel.findById(id);
    if (select.password) {
      query.select('+_password');
    }

    return query.exec();
  }

  update(id: string, updateDto: UpdateUserDto): Promise<UserDocument> {
    return this.userModel.findByIdAndUpdate(id, changeDto(updateDto), { new: true }).exec();
  }

  /**
   * 更新用户认证信息
   * @param identity Identity
   * @returns
   */
  updateIdentity(id: string, identity: Pick<Identity, 'name' | 'type'>): Promise<UserDocument> {
    return this.userModel
      .findByIdAndUpdate(id, {
        identity: {
          ...identity,
          verifyAt: new Date(),
          verified: true,
        },
      })
      .exec();
  }

  upsert(user: CreateUserDto) {
    return this.userModel
      .findOneAndUpdate({ username: user.username }, changeDto(user), { upsert: true, new: true })
      .exec();
  }

  delete(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  /**
   * 获取用户信息
   * @param login username or email
   * @returns
   */
  findByLogin(login: string): Promise<UserDocument> {
    return this.userModel.findOne({ $or: [{ username: login }, { email: login }] }).exec();
  }

  /**
   * 手机号获取用户信息
   */
  findByLoginWithPhone(phone: string, dialingPrefix: string, scope: string): Promise<UserDocument> {
    return this.userModel.findOne({ phone, dialingPrefix, scope }).exec();
  }

  /**
   * 邮箱获取用户信息
   */
  findByLoginWithEmail(email: string, scope: string): Promise<UserDocument> {
    return this.userModel.findOne({ email, scope }).exec();
  }

  /**
   * 【慎用！！】获取用户信息（包含密码）
   * @param login username, email, phone with dialing prefix
   * @returns
   */
  findByLoginWithPassword(login: string, scope: string): Promise<UserDocument> {
    if (isEmail(login)) {
      return this.userModel
        .findOne({
          email: login,
          scope,
        })
        .select('_password')
        .exec();
    } else if (isUserName(login)) {
      return this.userModel
        .findOne({
          username: login,
          scope,
        })
        .select('_password')
        .exec();
    } else {
      const [dialingPrefix, phone] = login.split('-', 2);
      return this.userModel
        .findOne({
          phone: phone,
          dialingPrefix: dialingPrefix,
          scope,
        })
        .select('_password')
        .exec();
    }
  }

  /**
   * 【慎用！！】获取用户信息（包含密码和认证）
   * @param id user id
   * @returns
   */
  findByIdWithPassword(id: string): Promise<UserDocument> {
    return this.userModel.findById(id).select('+_password').exec();
  }
}
