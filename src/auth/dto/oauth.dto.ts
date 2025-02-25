import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class OAuthDto {
  @IsNotEmpty()
  @IsString()
  provider: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  grant_type?: string;

  @IsOptional()
  @IsString()
  redirect_uri?: string;
}
