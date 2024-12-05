import { IsNotEmpty, IsString } from 'class-validator';

export class GithubDto {
  @IsNotEmpty()
  @IsString()
  code: string;
}
