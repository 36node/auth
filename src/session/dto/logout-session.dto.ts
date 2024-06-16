import { IsNotEmpty, IsString } from 'class-validator';

export class LogoutSessionDto {
  @IsNotEmpty()
  @IsString()
  key: string;
}
