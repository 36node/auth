import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsInt,
  IsIP,
  IsMobilePhone,
  IsOptional,
  IsString,
} from 'class-validator';
import { Document } from 'mongoose';

import { IsPassword, IsUsername } from 'src/common/validate';
import { SortFields } from 'src/lib/sort';
import { helper, MongoEntity } from 'src/mongo';

@Schema()
@SortFields(['lastLoginAt', 'expireAt'])
export class UserDoc {
  /**
   * 头像
   */
  @IsOptional()
  @IsString()
  @Prop()
  avatar?: string;

  /**
   * 生日
   */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @Prop()
  birthday?: Date;

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
  @Prop({ unique: true, sparse: true })
  email?: string;

  /**
   * 姓名
   */
  @IsOptional()
  @IsString()
  @Prop()
  name?: string;

  /*
   * 身份证
   */
  @IsOptional()
  @Prop()
  identity?: string;

  /**
   * 实名认证时间
   */
  @IsOptional()
  @IsDate()
  @Prop()
  identityVerifiedAt?: Date;

  /**
   * 实名认证是否通过
   */
  @IsOptional()
  @IsBoolean()
  @Prop()
  identityVerified?: boolean;

  /**
   * 简介
   */
  @IsOptional()
  @IsString()
  @Prop()
  intro?: string;

  /**
   * 邀请人
   */
  @IsOptional()
  @IsString()
  @Prop()
  inviter?: string;

  /**
   * 标签
   */
  @IsOptional()
  @IsString({ each: true })
  @Prop()
  labels: string[];

  /**
   * 使用语言
   */
  @IsOptional()
  @IsString()
  @Prop()
  language?: string;

  /**
   * 最后登录 IP
   */
  @IsOptional()
  @IsIP()
  @Prop()
  lastLoginIp?: string;

  /**
   * 最后活跃时间
   */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @Prop()
  lastSeenAt?: Date;

  /**
   * 等级
   */
  @IsOptional()
  @IsInt()
  @Prop()
  level?: number;

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
  @IsOptional()
  @IsString()
  @Prop()
  ns?: string;

  /**
   * 密码
   */
  @IsOptional()
  @IsPassword()
  @ApiProperty({ type: String, writeOnly: true })
  @Prop({ hideJSON: true })
  password?: string;

  /**
   * 手机号
   */
  @IsOptional()
  @IsString()
  @IsMobilePhone('zh-CN') // 中国大陆地区手机号
  @Prop({ unique: true, sparse: true })
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
  roles: string[];

  /**
   * 用户名
   */
  @IsOptional()
  @IsString()
  @IsUsername()
  @Prop({ unique: true, sparse: true })
  username?: string;

  /**
   * 是否有密码
   */
  @ApiProperty({ type: Boolean, readOnly: true })
  hasPassword?: boolean;

  /**
   * 员工编号
   */
  @IsOptional()
  @IsString()
  @Prop({ unique: true, sparse: true })
  employeeId?: string;

  /**
   * 权限
   */
  @IsOptional()
  @IsString({ each: true })
  @Prop()
  permissions: string[];

  /**
   * 团队
   */
  @IsOptional()
  @IsString({ each: true })
  @Prop()
  groups: string[];

  /**
   * 最后登录时间
   */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @Prop()
  lastLoginAt?: Date;

  /**
   * 是否启用
   */
  @IsOptional()
  @IsBoolean()
  @Prop()
  active?: boolean;

  /**
   * 状态
   */
  @IsOptional()
  @IsString()
  @Prop()
  status?: string;

  /**
   * 过期时间
   */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @Prop()
  expireAt?: Date;

  /**
   * 类型, 登录端
   */
  @IsOptional()
  @IsString()
  @Prop()
  type?: string;
}

export const UserSchema = helper(SchemaFactory.createForClass(UserDoc));
export class User extends IntersectionType(UserDoc, MongoEntity) {}
export type UserDocument = User & Document;

UserSchema.virtual('hasPassword').get(function (): boolean {
  return !!this.password;
});
