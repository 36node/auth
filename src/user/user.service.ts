import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import Debug from 'debug';
import { DeleteResult } from 'mongodb';
import { FilterQuery, Model } from 'mongoose';
import { nanoid } from 'nanoid';

import { ErrorCodes } from 'src/constants';
import { createHash, validateHash } from 'src/lib/crypt';
import { countTailZero, inferNumber } from 'src/lib/lang/number';
import { buildMongooseQuery, genAggGroupId, genSort, unWindGroupId } from 'src/mongo';

import { AggregateUserDto, DateUnit, GroupField } from './dto/aggregate.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersQuery } from './dto/list-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserAggregateResult } from './entities/user.aggregate.entity';
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

function buildUserWritePayload(dto: CreateUserDto, id?: string) {
  const { id: dtoId, ...rest } = dto;
  const payload = hashPwd(rest as CreateUserDto);

  return {
    _id: id ?? dtoId ?? nanoid(),
    ...payload,
  };
}

function buildUserUpsertPayload(dto: CreateUserDto, id?: string) {
  const { id: dtoId, ...rest } = dto;
  const payload = hashPwd(rest as CreateUserDto);

  return {
    $set: payload,
    $setOnInsert: {
      _id: id ?? dtoId ?? nanoid(),
    },
  };
}

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  private async executeUserWrite<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.throwIfDuplicateKeyError(error);
      throw error;
    }
  }

  private throwIfDuplicateKeyError(error: unknown): never | void {
    if (!this.isDuplicateKeyError(error)) {
      return;
    }

    const { field, value } = this.extractDuplicateField(error);
    switch (field) {
      case '_id':
        throw new ConflictException({
          code: ErrorCodes.USER_ALREADY_EXISTS,
          message: `User ${value} already exists.`,
          keyValue: { id: value },
        });
      case 'username':
        throw new ConflictException({
          code: ErrorCodes.USER_ALREADY_EXISTS,
          message: `Username ${value} already exists.`,
          keyValue: { username: value },
        });
      case 'employeeId':
        throw new ConflictException({
          code: ErrorCodes.EMPLOYEE_ID_ALREADY_EXISTS,
          message: `EmployeeId ${value} already exists.`,
          keyValue: { employeeId: value },
        });
      case 'email':
        throw new ConflictException({
          code: ErrorCodes.EMAIL_ALREADY_EXISTS,
          message: `Email ${value} already exists.`,
          keyValue: { email: value },
        });
      case 'phone':
        throw new ConflictException({
          code: ErrorCodes.PHONE_ALREADY_EXISTS,
          message: `Phone ${value} already exists.`,
          keyValue: { phone: value },
        });
      default:
        throw new ConflictException({
          code: ErrorCodes.DUPLICATE,
          message: 'Duplicate key error.',
          keyValue: { [field]: value },
        });
    }
  }

  private isDuplicateKeyError(error: unknown): error is {
    code: number;
    keyPattern?: Record<string, unknown>;
    keyValue?: Record<string, unknown>;
    message?: string;
  } {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
  }

  private extractDuplicateField(error: {
    keyPattern?: Record<string, unknown>;
    keyValue?: Record<string, unknown>;
    message?: string;
  }): { field: string; value: string } {
    const keyPattern = error.keyPattern ?? {};
    const keyValue = error.keyValue ?? {};
    const field = Object.keys(keyPattern)[0] ?? Object.keys(keyValue)[0] ?? 'unknown';
    const value = keyValue[field];

    if (value !== undefined && value !== null) {
      return { field, value: String(value) };
    }

    const match = error.message?.match(
      /index:\s+([^\s]+)\s+dup key:\s+\{\s+([^:]+):\s+"?([^"}]+)"?\s+\}/i
    );
    if (match) {
      return {
        field: match[2].trim(),
        value: match[3].trim(),
      };
    }

    return { field, value: 'unknown' };
  }

  checkPassword(hash: string, password: string): boolean {
    return validateHash(hash, password);
  }

  create(createDto: CreateUserDto): Promise<UserDocument> {
    debug('create user with %o', createDto);
    const payload = buildUserWritePayload(createDto);
    debug('create user with %o', payload);
    return this.executeUserWrite(async () => {
      const createdUser = new this.userModel(payload);
      return createdUser.save();
    });
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
    return this.executeUserWrite(() =>
      this.userModel.findByIdAndUpdate(id, updateDto, { new: true }).exec()
    );
  }

  updatePassword(id: string, password: string): Promise<UserDocument> {
    return this.userModel
      .findByIdAndUpdate(id, { password: createHash(password) }, { new: true })
      .exec();
  }

  upsertByUsername(username: string, dto: CreateUserDto) {
    return this.executeUserWrite(() =>
      this.userModel
        .findOneAndUpdate({ username }, buildUserUpsertPayload(dto), { upsert: true, new: true })
        .exec()
    );
  }

  upsertByPhone(phone: string, dto: CreateUserDto) {
    return this.executeUserWrite(() =>
      this.userModel
        .findOneAndUpdate({ phone }, buildUserUpsertPayload(dto), { upsert: true, new: true })
        .exec()
    );
  }

  upsertByEmail(email: string, dto: CreateUserDto) {
    return this.executeUserWrite(() =>
      this.userModel
        .findOneAndUpdate({ email }, buildUserUpsertPayload(dto), { upsert: true, new: true })
        .exec()
    );
  }

  upsertByEmployee(employeeId: string, dto: CreateUserDto) {
    return this.executeUserWrite(() =>
      this.userModel
        .findOneAndUpdate({ employeeId }, buildUserUpsertPayload(dto), { upsert: true, new: true })
        .exec()
    );
  }

  upsertById(id: string, dto: CreateUserDto) {
    return this.executeUserWrite(() =>
      this.userModel
        .findOneAndUpdate({ _id: id }, buildUserUpsertPayload(dto, id), {
          upsert: true,
          new: true,
        })
        .exec()
    );
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

  /**
   * 统计
   */
  aggregate(query: ListUsersQuery, dto: AggregateUserDto): Promise<UserAggregateResult[]> {
    const { filter, offset, limit, sort } = buildMongooseQuery(wrapFilter(query));
    const { group = [], dateUnit = DateUnit.day } = dto;

    // 处理时间字段分组
    let groupId: any = {};
    const hasCreatedAt = group.includes(GroupField.createdAt);

    if (hasCreatedAt) {
      // 分离出非时间字段
      const nonTimeFields = group.filter((field) => field !== GroupField.createdAt);
      // 为时间字段生成特殊的分组ID
      groupId = {
        ...genAggGroupId(nonTimeFields),
        createdAt: this.getDateGroupExpression(dateUnit),
      };
    } else {
      groupId = genAggGroupId(group);
    }

    // 特殊字段需要先进行 $unwind
    const unwindFields = ['labels', 'groups', 'roles'];
    const unwindStages = group
      .filter((field) => unwindFields.includes(field))
      .map((field) => ({ $unwind: { path: `$${field}`, preserveNullAndEmptyArrays: true } }));

    const pipeline = [
      { $match: filter },
      ...unwindStages, // 添加 $unwind 阶段
      {
        $group: {
          _id: groupId,
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          ...unWindGroupId(groupId),
          _id: 0,
          count: 1,
        },
      },
      sort && {
        $sort: genSort(sort),
      },
      offset && {
        $skip: offset,
      },
      limit && {
        $limit: limit,
      },
    ].filter(Boolean);

    return this.userModel.aggregate(pipeline);
  }

  private getDateGroupExpression(dateUnit: DateUnit) {
    const dateExpression = '$createdAt';

    switch (dateUnit) {
      case DateUnit.hour:
        return {
          year: { $year: dateExpression },
          month: { $month: dateExpression },
          day: { $dayOfMonth: dateExpression },
          hour: { $hour: dateExpression },
        };
      case DateUnit.day:
        return {
          year: { $year: dateExpression },
          month: { $month: dateExpression },
          day: { $dayOfMonth: dateExpression },
        };
      case DateUnit.week:
        return {
          year: { $year: dateExpression },
          week: { $week: dateExpression },
        };
      case DateUnit.month:
        return {
          year: { $year: dateExpression },
          month: { $month: dateExpression },
        };
      case DateUnit.year:
        return {
          year: { $year: dateExpression },
        };
      default:
        return {
          year: { $year: dateExpression },
          month: { $month: dateExpression },
          day: { $dayOfMonth: dateExpression },
        };
    }
  }
}
