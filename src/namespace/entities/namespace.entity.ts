import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IntersectionType } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Document } from 'mongoose';

import { IsNs as IsNskey, IsRegExp } from 'src/common/validate';
import { helper } from 'src/lib/mongoose-helper';
import { MongoEntity } from 'src/mongo';

@Schema()
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
   * 所属命名空间
   *
   * / 是分隔符，不允许出现在 namespace 的 ns 中，^[a-zA-Z][a-zA-Z0-9._-]{0,30}$
   */
  @IsNotEmpty()
  @IsString()
  @IsNskey()
  @Prop()
  key: string;

  /**
   * 父级命名空间
   */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Prop()
  parent?: string;

  /**
   * 是否为 Scope
   */
  @IsNotEmpty()
  @IsBoolean()
  isScope: boolean;

  /**
   * namesapce 全路径
   */
  @IsNotEmpty()
  @IsString()
  ns: string;

  /**
   * 默认角色
   */
  @IsOptional()
  @IsString({ each: true })
  @Prop({ type: [String] })
  registerDefaultRoles?: string[];

  /**
   * 自定义密码规则
   */
  @IsOptional()
  @IsString()
  @IsRegExp()
  @Prop()
  passwordRegExp?: string;
}

export const NamespaceSchema = helper(SchemaFactory.createForClass(NamespaceDoc));
export class Namespace extends IntersectionType(NamespaceDoc, MongoEntity) {}
export type NamespaceDocument = Namespace & Document;

NamespaceSchema.virtual('isScope').get(function (): boolean {
  return this.parent ? false : true;
});

NamespaceSchema.virtual('ns').get(function (): string {
  const parent = this.parent || '';
  const sep = parent ? '/' : '';
  return `${parent}${sep}${this.key}`;
});

NamespaceSchema.index({ key: 1, parent: 1 }, { unique: true });
