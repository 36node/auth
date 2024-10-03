import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IntersectionType } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Document } from 'mongoose';

import { helper, MongoEntity } from 'src/mongo';

@Schema()
export class GroupDoc {
  /**
   * 名称
   */
  @IsNotEmpty()
  @IsString()
  @Prop({ unique: true })
  name: string;

  /**
   * 权限
   */
  @IsOptional()
  @IsString({ each: true })
  @Prop()
  permissions?: string[];

  /**
   * 是否启用
   */
  @IsOptional()
  @IsBoolean()
  @Prop()
  active?: boolean;

  /**
   * 人数
   */
  @IsOptional()
  @IsNumber()
  @Prop()
  userCount?: number;
}

export const GroupSchema = helper(SchemaFactory.createForClass(GroupDoc));
export class Group extends IntersectionType(GroupDoc, MongoEntity) {}
export type GroupDocument = Group & Document;
