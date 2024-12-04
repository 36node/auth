import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IntersectionType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Document } from 'mongoose';
import autopopulate from 'mongoose-autopopulate';

import { SortFields } from 'src/lib/sort';
import { helper, MongoEntity } from 'src/mongo';
import { ThirdPartySource } from 'src/third-party/entities/third-party.entity';

@Schema()
@SortFields(['refreshTokenExpireAt'])
export class SessionDoc {
  /**
   * 会话过期时间
   */
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  @Prop({ expires: '10s' })
  refreshTokenExpireAt: Date;

  /**
   * refresh token
   */
  @IsNotEmpty()
  @IsString()
  @Prop()
  refreshToken: string;

  /**
   * 用户或第三方用户
   */
  @IsNotEmpty()
  @IsString()
  @Prop()
  uid: string;

  /**
   * 第三方来源
   */
  @IsOptional()
  @IsEnum(ThirdPartySource)
  @Prop()
  source?: ThirdPartySource;

  /**
   * 客户端/设备
   */
  @IsOptional()
  @IsString()
  @Prop()
  client?: string;

  /**
   * 用户动态权限
   */
  @IsOptional()
  @IsString({ each: true })
  @Prop()
  permissions?: string[];

  /**
   * user ns
   */
  @IsOptional()
  @IsString()
  @Prop()
  ns?: string;

  /**
   * 类型，支持设置多个
   */
  @IsOptional()
  @IsString({ each: true })
  @Prop()
  type?: string[];
}

class SessionDocMethods {
  /**
   * 判断 session 是否需要轮换
   * 当剩余时间小于 1/5 时，需要轮换
   *
   * @returns boolean 是否需要轮换
   */
  shouldRotate() {
    const self = this as any as SessionDocument;
    const duration = self.refreshTokenExpireAt.getTime() - self.createdAt?.getTime();
    const left = self.refreshTokenExpireAt.getTime() - Date.now();
    return left < duration / 5;
  }
}

export const SessionSchema = helper(SchemaFactory.createForClass(SessionDoc));
export class Session extends IntersectionType(SessionDoc, SessionDocMethods, MongoEntity) {}
export type SessionDocument = Session & Document;

// auto populate and load methods
SessionSchema.plugin(autopopulate);
SessionSchema.loadClass(SessionDocMethods);
