import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IntersectionType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Document } from 'mongoose';
import autopopulate from 'mongoose-autopopulate';

import { SortFields } from 'src/lib/sort';
import { helper, MongoEntity } from 'src/mongo';

@Schema()
@SortFields(['expireAt'])
export class SessionDoc {
  /**
   * 会话过期时间
   */
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  @Prop({ expires: '10s' })
  expireAt: Date;

  /**
   * session key
   * 可以作为 refresh token
   */
  @IsNotEmpty()
  @IsString()
  @Prop()
  key: string;

  /**
   * 用户或第三方用户 id
   */
  @IsNotEmpty()
  @IsString()
  @Prop()
  subject: string;

  /**
   * 如果来自第三方，则会加上 source
   */
  @IsOptional()
  @IsString()
  @Prop()
  source?: string;

  /**
   * 角色之外的权限
   */
  @IsOptional()
  @IsString({ each: true })
  @Prop()
  permissions?: string[];

  /**
   * 角色
   */
  @IsOptional()
  @IsString({ each: true })
  @Prop()
  roles?: string[];

  /**
   * 用户所属的组
   */
  @IsOptional()
  @IsString({ each: true })
  @Prop()
  groups?: string[];

  /**
   * user ns
   */
  @IsOptional()
  @IsString()
  @Prop()
  ns?: string;

  /**
   * 用户类型
   */
  @IsOptional()
  @IsString()
  @Prop()
  type?: string;

  /**
   * 一次性的，禁止轮换
   */
  @IsOptional()
  @IsBoolean()
  @Prop()
  oneTimeUse?: boolean;
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
    if (self.oneTimeUse) return false; // 一次性的 session 不需要轮换
    const duration = self.expireAt.getTime() - self.createdAt?.getTime();
    const left = self.expireAt.getTime() - Date.now();
    return left < duration / 5;
  }
}

export const SessionSchema = helper(SchemaFactory.createForClass(SessionDoc));
export class Session extends IntersectionType(SessionDoc, SessionDocMethods, MongoEntity) {}
export type SessionDocument = Session & Document;

// auto populate and load methods
SessionSchema.plugin(autopopulate);
SessionSchema.loadClass(SessionDocMethods);
