import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetAuthorizerQuery {
  @IsNotEmpty()
  @IsString()
  provider: string;

  @IsOptional()
  @IsString()
  redirect_uri?: string;

  @IsOptional()
  @IsString()
  state?: string;
}
