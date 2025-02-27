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
  grantType?: string;

  @IsOptional()
  @IsString()
  redirectUri?: string;
}
