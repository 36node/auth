import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IntersectionType } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { helper, MongoEntity } from 'src/mongo';

@Schema()
export class ThirdPartyDoc {
  /**
   * 第三方登录来源
   */
  @IsNotEmpty()
  @IsString()
  @Prop()
  source: string;

  /**
   * 第三方登录的用户唯一标识
   */
  @IsNotEmpty()
  @IsString()
  @Prop()
  tid: string;

  /**
   * 第三方登录 accessToken
   */
  @IsNotEmpty()
  @IsString()
  @Prop()
  accessToken: string;

  /**
   * 第三方登录过期时间
   */
  @IsOptional()
  @Prop()
  expireAt?: number;

  /**
   * 第三方登录 token 类型
   */
  @IsOptional()
  @IsString()
  @Prop()
  tokenType?: string;

  /**
   * 第三方登录 refreshToken
   */
  @IsOptional()
  @IsString()
  @Prop()
  refreshToken?: string;

  /**
   * 第三方登录 refreshToken 过期时间
   */
  @IsOptional()
  @Prop()
  refreshTokenExpireAt?: number;

  /**
   * 关联uid
   */
  @IsOptional()
  @IsMongoId()
  @Prop()
  uid?: string;

  /**
   * 用于存储第三方的额外数据
   */
  @IsNotEmpty()
  @IsString()
  @Prop()
  data: string;
}

export const ThirdPartySchema = helper(SchemaFactory.createForClass(ThirdPartyDoc));
export class ThirdParty extends IntersectionType(ThirdPartyDoc, MongoEntity) {}
export type ThirdPartyDocument = ThirdPartyDoc & Document;

ThirdPartySchema.index({ source: 1, tid: 1 }, { unique: true });
ThirdPartySchema.index({ source: 1, uid: 1 }, { sparse: true });
