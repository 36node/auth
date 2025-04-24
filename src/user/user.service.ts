import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import Debug from 'debug';
import { DeleteResult } from 'mongodb';
import { FilterQuery, Model } from 'mongoose';

import { createHash, validateHash } from 'src/lib/crypt';
import { countTailZero, inferNumber } from 'src/lib/lang/number';
import { buildMongooseQuery } from 'src/mongo';

import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersQuery } from './dto/list-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';

const debug = Debug('auth:user:service');

function wrapFilter(filter: any) {
  if (filter.registerRegion && inferNumber(filter.registerRegion)) {
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

function hashPwd(dto: CreateUserDto) {
  const res = { ...dto };
  if (dto.password) {
    res.password = createHash(dto.password);
  }
  return res;
}

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  checkPassword(hash: string, password: string): boolean {
    return validateHash(hash, password);
  }

  create(createDto: CreateUserDto): Promise<UserDocument> {
    debug('create user with %o', createDto);
    debug('create user with %o', hashPwd(createDto));
    const createdUser = new this.userModel(hashPwd(createDto));
    return createdUser.save();
  }

  count(query: ListUsersQuery): Promise<number> {
    const { filter } = buildMongooseQuery(query);
    return this.userModel.countDocuments(wrapFilter(filter)).exec();
  }

  list(query: ListUsersQuery): Promise<UserDocument[]> {
    const { limit = 10, sort, offset = 0, filter } = buildMongooseQuery(query);
    return this.userModel.find(wrapFilter(filter)).sort(sort).skip(offset).limit(limit).exec();
  }

  get(id: string): Promise<UserDocument> {
    return this.userModel.findById(id).exec();
  }

  update(id: string, updateDto: UpdateUserDto): Promise<UserDocument> {
    return this.userModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  updatePassword(id: string, password: string): Promise<UserDocument> {
    return this.userModel
      .findByIdAndUpdate(id, { password: createHash(password) }, { new: true })
      .exec();
  }

  upsertByUsername(username: string, dto: CreateUserDto) {
    return this.userModel
      .findOneAndUpdate({ username }, hashPwd(dto), { upsert: true, new: true })
      .exec();
  }

  upsertByPhone(phone: string, dto: CreateUserDto) {
    return this.userModel
      .findOneAndUpdate({ phone }, hashPwd(dto), { upsert: true, new: true })
      .exec();
  }

  upsertByEmail(email: string, dto: CreateUserDto) {
    return this.userModel
      .findOneAndUpdate({ email }, hashPwd(dto), { upsert: true, new: true })
      .exec();
  }

  upsertByEmployee(employeeId: string, dto: CreateUserDto) {
    return this.userModel
      .findOneAndUpdate({ employeeId }, hashPwd(dto), { upsert: true, new: true })
      .exec();
  }

  delete(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  /**
   * 获取用户信息
   * @param login phone/username/email
   * @returns
   */
  findByLogin(login: string): Promise<UserDocument> {
    return this.userModel
      .findOne({ $or: [{ username: login }, { email: login }, { phone: login }] })
      .exec();
  }

  /**
   * 手机号获取用户信息
   */
  findByPhone(phone: string): Promise<UserDocument> {
    return this.userModel.findOne({ phone }).exec();
  }

  /**
   * 邮箱获取用户信息
   */
  findByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email }).exec();
  }

  /**
   * 根据 username 获取用户信息
   */
  findByUsername(username: string): Promise<UserDocument> {
    return this.userModel.findOne({ username }).exec();
  }

  /**
   * 根据身份证号获取用户信息
   *
   * @param identity 身份证
   * @returns UserDocument
   */
  findByIdentity(identity: string): Promise<UserDocument> {
    return this.userModel.findOne({ identity }).exec();
  }

  /**
   * 根据员工号获取用户信息
   *
   * @param employeeId 员工号
   * @returns UserDocument
   */
  findByEmployeeId(employeeId: string): Promise<UserDocument> {
    return this.userModel.findOne({ employeeId }).exec();
  }

  /**
   * 根据条件查找用户
   *
   * @returns
   */
  findOne(filter: FilterQuery<UserDocument>): Promise<UserDocument> {
    return this.userModel.findOne(filter).exec();
  }

  /**
   * 非常危险的操作
   *
   * @returns
   */
  cleanupAllData(): Promise<DeleteResult> {
    return this.userModel.deleteMany({}).exec();
  }
}
