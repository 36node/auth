import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  /**
   * refresh token 也就是 session key
   */
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
