import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IntersectionType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

import { SortFields } from 'src/lib/sort';
import { helper, MongoEntity } from 'src/mongo';

import * as config from '../config';

@Schema()
@SortFields(['expireAt'])
export class CaptchaDoc {
  /**
   * 验证码
   */
  @IsNotEmpty()
  @IsString()
  @Prop()
  code: string;

  /**
   * 过期时间
   */
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  @Prop({ default: () => Date.now() + config.expiresInS * 1000, expires: '7d' })
  expireAt: Date;

  /**
   * key
   */
  @IsNotEmpty()
  @IsString()
  @Prop({ unique: true })
  key: string;
}

export const CaptchaSchema = helper(SchemaFactory.createForClass(CaptchaDoc));
export class Captcha extends IntersectionType(CaptchaDoc, MongoEntity) {}
export type CaptchaDocument = Captcha & Document;

CaptchaSchema.index({ key: 1, scope: 1 }, { unique: true });
