import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { IdentityType } from '../../user/entities/user.entity';

export class VerifyIdentityDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  identity: string;

  @IsNotEmpty()
  @IsEnum(IdentityType)
  @ApiProperty({ enum: IdentityType, enumName: 'IdentityType' })
  type: IdentityType;
}
