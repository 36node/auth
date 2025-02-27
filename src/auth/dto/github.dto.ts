import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GithubDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  redirectUri?: string;

  @IsOptional()
  @IsString()
  repositoryId?: string;
}
