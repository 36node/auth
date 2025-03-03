import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class bindThirdPartyDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsNotEmpty()
  @IsString()
  source: string;

  @IsNotEmpty()
  @IsString()
  tid: string;
}
