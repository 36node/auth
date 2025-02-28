import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class OAuthGetAccessTokenDto {
  @IsNotEmpty()
  @IsString()
  client_id: string;

  @IsNotEmpty()
  @IsString()
  client_secret: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  redirect_uri?: string;

  @IsOptional()
  @IsString()
  grant_type?: string;
}
