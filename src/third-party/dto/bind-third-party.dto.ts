import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { ThirdPartySource } from '../entities/third-party.entity';

export class bindThirdPartyDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsEnum(ThirdPartySource)
  source: ThirdPartySource;

  @IsNotEmpty()
  @IsString()
  login: string;
}
