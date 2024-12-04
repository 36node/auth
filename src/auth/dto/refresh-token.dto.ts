import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  /**
   * user id
   */
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
