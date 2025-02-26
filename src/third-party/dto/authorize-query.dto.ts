import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AuthorizeQueryDto {
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
