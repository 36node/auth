import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { helper, MongoEntity } from 'src/mongo';

export enum ThirdPartySource {
  GITHUB = 'GitHub',
  WECHAT = 'WeChat',
}

@Schema()
export class ThirdPartyDoc {
  /**
   * 第三方登录来源
   */
  @IsNotEmpty()
  @IsEnum(ThirdPartySource)
  @ApiProperty({ enum: ThirdPartySource, enumName: 'ThirdPartySource' })
  @Prop()
  source: ThirdPartySource;

  /**
   * 第三方登录 id
   */
  @IsNotEmpty()
  @IsString()
  @Prop()
  login: string;

  /**
   * 第三方登录 accessToken
   */
  @IsNotEmpty()
  @IsString()
  @Prop()
  accessToken: string;

  /**
   * 关联uid
   */
  @IsOptional()
  @IsMongoId()
  @Prop()
  uid?: string;
}

export const ThirdPartySchema = helper(SchemaFactory.createForClass(ThirdPartyDoc));
export class ThirdParty extends IntersectionType(ThirdPartyDoc, MongoEntity) {}
export type ThirdPartyDocument = ThirdPartyDoc & Document;
