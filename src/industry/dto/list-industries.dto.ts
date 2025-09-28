import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class ListIndustriesQuery {
  /**
   * 返回的层数
   * 默认返回所有层级
   */
  @IsOptional()
  @IsPositive()
  @IsInt()
  @Type(() => Number)
  depth?: number;
}
