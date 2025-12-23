import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IntersectionType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Document } from 'mongoose';

import { IsNs } from 'src/common/validate';
import { SortFields } from 'src/lib/sort';
import { helper, MongoEntity } from 'src/mongo';

@Schema()
@SortFields(['key', 'name', 'seq'])
export class NamespaceDoc {
  /**
   * 额外数据
   */
  @IsOptional()
  @IsString()
  @Prop()
  data?: string;

  /**
   * 描述
   */
  @IsOptional()
  @IsString()
  @Prop()
  desc?: string;

  /**
   * 标签
   */
  @IsOptional()
  @IsString({ each: true })
  @Prop({ type: [String] })
  labels?: string[];

  /**
   * 名称
   */
  @IsNotEmpty()
  @IsString()
  @Prop()
  name: string;

  /**
   * 命名空间的 key
   *
   * 允许的字符 ^[a-zA-Z][a-zA-Z0-9._/-]{0,200}$
   */
  @IsNotEmpty()
  @IsNs()
  @Prop({ unique: true })
  key: string;

  /**
   * 所属的 namespace key
   */
  @IsOptional()
  @IsNs()
  @Prop()
  ns?: string;

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
   * 默认密码
   */
  @IsOptional()
  @IsString()
  @Prop()
  defaultPassword?: string;

  /**
   * 是否可导出
   */
  @IsOptional()
  @IsBoolean()
  @Prop()
  exportable?: boolean;

  /**
   * 排序
   */
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Prop()
  seq?: number;
}

export const NamespaceSchema = helper(SchemaFactory.createForClass(NamespaceDoc));
export class Namespace extends IntersectionType(NamespaceDoc, MongoEntity) {}
export type NamespaceDocument = Namespace & Document;
