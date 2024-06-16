import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IntersectionType, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Document } from 'mongoose';
import autopopulate from 'mongoose-autopopulate';

import { Acl } from 'src/auth';
import { helper } from 'src/lib/mongoose-helper';
import { SortFields } from 'src/lib/sort';
import { MyInfo } from 'src/me/entities/my-info.entity';
import { MongoEntity } from 'src/mongo';
import { User } from 'src/user/entities/user.entity';

@Schema()
@SortFields(['expireAt'])
export class SessionDoc {
  /**
   * 访问控制列表
   */
  @IsOptional()
  @Prop({ type: Object })
  acl?: Acl;

  /**
   * 会话过期时间
   */
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  @Prop({ expires: '10s' })
  expireAt: Date;

  /**
   * refresh token key
   */
  @IsNotEmpty()
  @IsString()
  @Prop()
  key: string;

  /**
   * 用户 ID
   */
  @IsNotEmpty()
  @IsString()
  @Prop({ type: String, ref: User.name, autopopulate: true })
  user: User;

  /**
   * 客户端/设备
   */
  @IsOptional()
  @IsString()
  @Prop()
  client?: string;

  /**
   * token 有效时长
   *
   * short time span string
   *
   * refs: https://github.com/vercel/ms
   *
   * eg: "2 days", "10h", "7d", "120s", "2.5 hrs", "2h", "1m", "5s", "1y", "100", "1y1m1d"
   *
   * m => minute
   * h => hour
   * d => day
   * w => week
   * M => month
   * y => year
   * s => second
   * ms => millisecond
   * 无单位 => millisecond
   */
  @IsOptional()
  @IsString()
  @Prop()
  tokenExpiresIn?: string;
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
    const duration = self.expireAt.getTime() - self.createAt?.getTime();
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

export class OnlyToken {
  /**
   * token
   */
  token: string;

  /**
   * token 过期时间
   */
  tokenExpireAt: Date;
}

export class SessionWithToken extends OmitType(IntersectionType(Session, OnlyToken), [
  'user',
] as const) {
  @IsNotEmpty()
  user: MyInfo;
}
