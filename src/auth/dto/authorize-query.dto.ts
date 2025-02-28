import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetAuthorizerQuery {
  @IsNotEmpty()
  @IsString()
  provider: string;

  @IsOptional()
  @IsString()
  redirectUri?: string;

  @IsOptional()
  @IsString()
  responseType?: string;

  @IsOptional()
  @IsString()
  state?: string;
}
