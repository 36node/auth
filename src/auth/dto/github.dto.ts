import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GithubDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  grant_type?: string;

  @IsOptional()
  @IsString()
  redirect_uri?: string;

  @IsOptional()
  @IsString()
  repository_id?: string;
}
