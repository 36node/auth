import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsDate, IsEnum, IsMobilePhone, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { SortFields } from 'src/lib/sort';
import { helper, MongoEntity } from 'src/mongo';

/**
 * 身份认证类型
 */
export enum SmsStatus {
  /**
   * pending
   */
  PENDING = 'pending',
  /**
   * sent
   */
  SENT = 'sent',
}

@Schema()
@SortFields(['sentAt'])
export class SmsRecordDoc {
  /**
   * 手机号
   */
  @IsNotEmpty()
  @IsMobilePhone('zh-CN')
  @Prop()
  phone: string;

  /**
   * 签名
   */
  @IsNotEmpty()
  @IsString()
  @Prop()
  sign: string;

  /**
   * 模板
   */
  @IsNotEmpty()
  @IsString()
  @Prop()
  template: string;

  /**
   * 参数
   */
  @IsOptional()
  @IsString()
  @Prop()
  params?: string;

  /**
   * 发送时间
   */
  @IsOptional()
  @IsDate()
  @Prop()
  sentAt?: Date;

  /**
   * 发送状态
   */
  @IsNotEmpty()
  @IsEnum(SmsStatus)
  @ApiProperty({ enum: SmsStatus, enumName: 'SmsStatus' })
  @Prop()
  status: SmsStatus;
}

export const SmsRecordSchema = helper(SchemaFactory.createForClass(SmsRecordDoc));
export class SmsRecord extends IntersectionType(SmsRecordDoc, MongoEntity) {}
export type SmsRecordDocument = SmsRecordDoc & Document & MongoEntity;
