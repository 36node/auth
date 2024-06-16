import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshSessionDto {
  @IsNotEmpty()
  @IsString()
  key: string;
}
