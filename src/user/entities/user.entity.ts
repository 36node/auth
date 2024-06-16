import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiHideProperty, ApiProperty, IntersectionType, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsIP,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Document } from 'mongoose';

import { IsUsername } from 'src/common/validate';
import { createHash, validateHash } from 'src/lib/crypt';
import { helper } from 'src/lib/mongoose-helper';
import { MongoEntity } from 'src/mongo';

type CheckPassword = (pwd: string) => Promise<boolean>;

/**
 * 身份认证类型
 */
export enum IdentityType {
  /**
   * ID
   */
  ID = 'ID',
}

@Schema({ _id: false })
export class Identity {
  /**
   * 真实姓名
   */
  @IsOptional()
  @IsString()
  @Prop()
  name?: string;

  /**
   * 认证类型
   */
  @IsOptional()
  @IsEnum(IdentityType)
  @ApiProperty({ enum: IdentityType, enumName: 'IdentityType' })
  @Prop()
  type?: IdentityType;

  /**
   * 认证时间
   */
  @IsOptional()
  @IsDate()
  @Prop()
  verifyAt?: Date;

  /**
   * 是否认证通过
   */
  @IsBoolean()
  @Prop()
  verified: boolean;
}

export type UserHiddenField = 'password';

@Schema()
export class UserDoc {
  /**
   * 头像
   */
  @IsOptional()
  @IsString()
  @Prop()
  avatar?: string;

  /**
   * 简介
   */
  @IsOptional()
  @IsString()
  @Prop()
  intro?: string;

  /**
   * 额外数据
   */
  @IsOptional()
  @IsString()
  @Prop()
  data?: string;

  /**
   * 邮箱
   */
  @IsOptional()
  @IsString()
  @IsEmail()
  @Prop()
  email?: string;

  /**
   * 使用语言
   */
  @IsOptional()
  @IsString()
  @Prop()
  language?: string;

  /**
   * 最后活跃时间
   */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @Prop()
  lastSeenAt?: Date;

  /**
   * 最后登录 IP
   */
  @IsOptional()
  @IsIP()
  @Prop()
  lastLoginIp?: string;

  /**
   * 昵称
   */
  @IsOptional()
  @IsString()
  @Prop()
  nickname?: string;

  /**
   * 所属命名空间
   */
  @IsNotEmpty()
  @IsString()
  @Prop()
  ns: string;

  /**
   * 真实存储密码的位置，不对外暴露
   */
  @IsOptional()
  @IsString()
  @Prop({ type: String, select: false })
  _password?: string;

  /**
   * 密码
   */
  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, writeOnly: true })
  password?: string;

  /**
   * 手机号
   */
  @IsOptional()
  @IsString()
  @Prop()
  phone?: string;

  /**
   * 注册 IP
   */
  @IsOptional()
  @IsIP()
  @Prop()
  registerIp?: string;

  /**
   * 注册地区，存地区编号
   */
  @IsOptional()
  @IsString()
  @Prop()
  registerRegion?: string;

  /**
   * 角色
   */
  @IsOptional()
  @IsString({ each: true })
  @Prop()
  roles?: string[];

  /**
   * 是否超级管理员
   */
  @IsOptional()
  @IsBoolean()
  @Prop()
  super?: boolean;

  /**
   * 用户名
   */
  @IsOptional()
  @IsString()
  @IsUsername()
  @Prop()
  username?: string;

  @ApiHideProperty()
  checkPassword?: CheckPassword;

  @IsNotEmpty()
  @IsString()
  @ApiHideProperty()
  @Prop({ type: String, select: false })
  scope: string;

  /**
   * 区号
   */
  @IsOptional()
  @IsString()
  @Prop()
  dialingPrefix?: string;

  /*
   * 实名认证
   */
  @IsOptional()
  @Prop({ type: Identity, default: { verified: false } })
  identity?: Identity;
}

export const UserSchema = helper(SchemaFactory.createForClass(UserDoc));
export class User extends OmitType(IntersectionType(UserDoc, MongoEntity), [
  '_password',
  'scope',
] as const) {}
export type UserDocument = User & Document;

UserSchema.virtual('password').set(function (pwd: string) {
  this._password = createHash(pwd);
  this.hasPassword = true;
});

UserSchema.methods.checkPassword = async function (pwd: string): Promise<boolean> {
  return this._password && validateHash(this._password, pwd);
};

UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj._password;
  delete obj.scope;
  return obj;
};

UserSchema.index(
  { scope: 1, username: 1 },
  { unique: true, partialFilterExpression: { username: { $exists: true } } }
);
UserSchema.index(
  { scope: 1, phone: 1, dialingPrefix: 1 },
  { unique: true, partialFilterExpression: { phone: { $exists: true } } }
);
UserSchema.index(
  { scope: 1, email: 1 },
  { unique: true, partialFilterExpression: { email: { $exists: true } } }
);
