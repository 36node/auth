import { IsEnum, IsOptional } from 'class-validator';

export enum GroupField {
  level = 'level',
  label = 'labels',
  language = 'language',
  ns = 'ns',
  registerRegion = 'registerRegion',
  role = 'roles',
  group = 'groups',
  active = 'active',
  status = 'status',
  createdAt = 'createdAt',
}

export enum DateUnit {
  hour = 'hour',
  day = 'day',
  week = 'week',
  month = 'month',
  year = 'year',
}

export class AggregateUserDto {
  /**
   * The group by clause
   */
  @IsOptional()
  @IsEnum(GroupField, { each: true })
  group?: GroupField[];

  /**
   * Date unit for time-based grouping when createdAt is in group
   */
  @IsOptional()
  @IsEnum(DateUnit)
  dateUnit?: DateUnit;
}
