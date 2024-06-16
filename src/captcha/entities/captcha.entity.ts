import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { settings } from 'src/config';
import { helper } from 'src/lib/mongoose-helper';
import { MongoEntity } from 'src/mongo';

export enum CaptchaPurpose {
  REGISTER = 'REGISTER',
  LOGIN = 'LOGIN',
  RESET_PASSWORD = 'RESET_PASSWORD',
  UPDATE_PHONE = 'UPDATE_PHONE',
  UPDATE_EMAIL = 'UPDATE_EMAIL',
}

@Schema()
export class CaptchaDoc {
  /**
   * 用途
   */
  @IsNotEmpty()
  @IsEnum(CaptchaPurpose)
  @ApiProperty({ enum: CaptchaPurpose, enumName: 'CaptchaPurpose' })
  @Prop()
  purpose: CaptchaPurpose;

  /**
   * key
   */
  @IsOptional()
  @IsString()
  @Prop({ unique: true })
  key: string;

  /**
   * 区号
   */
  @IsOptional()
  @IsString()
  @Prop()
  dialingPrefix?: string;

  /**
   * scope
   */
  @IsNotEmpty()
  @IsString()
  @Prop()
  scope: string;

  /**
   * 内容
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
  @Prop({ default: () => Date.now() + settings.captcha.expireAt * 1000, expires: '1s' })
  expireAt: Date;
}

export const CaptchaSchema = helper(SchemaFactory.createForClass(CaptchaDoc));
export class Captcha extends IntersectionType(CaptchaDoc, MongoEntity) {}
export type CaptchaDocument = Captcha & Document;

CaptchaSchema.index({ key: 1, scope: 1 }, { unique: true });
