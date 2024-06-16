import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateMyPasswordDto {
  /**
   * 旧密码
   */
  @IsOptional()
  @IsString()
  oldPassword?: string;

  /**
   * 新密码
   */
  @IsNotEmpty()
  @IsString()
  newPassword: string;
}
