import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsDate, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { SortFields } from 'src/lib/sort';
import { helper, MongoEntity } from 'src/mongo';

/**
 * 身份认证类型
 */
export enum EmailStatus {
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
export class EmailRecordDoc {
  /**
   * 发件者，支持纯邮箱或带显示名格式，例如 `robot@mail.36node.com` 或 `"robot" <robot@mail.36node.com>`
   */
  @IsNotEmpty()
  @IsEmail({ allow_display_name: true })
  @Prop()
  from: string;

  /**
   * 收件者
   */
  @IsNotEmpty()
  @IsString()
  @Prop()
  to: string;

  /**
   * 主题
   */
  @IsNotEmpty()
  @IsString()
  @Prop()
  subject: string;

  /**
   * 内容
   */
  @IsNotEmpty()
  @IsString()
  @Prop()
  content: string;

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
  @IsEnum(EmailStatus)
  @ApiProperty({ enum: EmailStatus, enumName: 'EmailStatus' })
  @Prop()
  status: EmailStatus;
}

export const EmailRecordSchema = helper(SchemaFactory.createForClass(EmailRecordDoc));
export class EmailRecord extends IntersectionType(EmailRecordDoc, MongoEntity) {}
export type EmailRecordDocument = EmailRecordDoc & Document & MongoEntity;
