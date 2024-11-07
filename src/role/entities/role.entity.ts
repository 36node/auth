import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IntersectionType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Document } from 'mongoose';

import { helper, MongoEntity } from 'src/mongo';

@Schema()
export class RoleDoc {
  /**
   * role key
   */
  @IsNotEmpty()
  @IsString()
  @Prop({ unique: true })
  key: string;

  /**
   * 名称
   */
  @IsNotEmpty()
  @IsString()
  @Prop()
  name: string;

  /**
   * 权限
   */
  @IsOptional()
  @IsString({ each: true })
  @Prop()
  permissions: string[];
}

export const RoleSchema = helper(SchemaFactory.createForClass(RoleDoc));
export class Role extends IntersectionType(RoleDoc, MongoEntity) {}
export type RoleDocument = Role & Document;
