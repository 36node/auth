import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

import { DateGroup } from 'src/mongo';

export class UserAggregateResult {
  @IsOptional()
  @IsNumber()
  level?: number;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  ns?: string;

  @IsOptional()
  @IsString()
  registerRegion?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  group?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  createdAt?: DateGroup;

  /**
   * 统计数量
   */
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  count: number;
}
