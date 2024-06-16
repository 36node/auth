import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryDto {
  /**
   * 分页大小
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  _limit?: number;

  /**
   * 分页偏移
   */
  @IsOptional()
  @Type(() => Number)
  _offset?: number;

  /**
   * 排序字段
   */
  @IsOptional()
  @IsString()
  _sort?: string;
}
