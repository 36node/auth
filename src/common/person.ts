import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  // OTHER = 'OTHER',
  UNKNOWN = 'UNKNOWN',
}

export class Person {
  /**
   * 姓名
   */
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  name: string;

  /**
   * 头像
   */
  @IsOptional()
  @IsString()
  @ApiProperty({ type: String })
  avatar?: string;
}
