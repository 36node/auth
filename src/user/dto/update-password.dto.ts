import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { IsPassword } from 'src/common/validate';

export class UpdatePasswordDto {
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
  @IsPassword()
  newPassword: string;
}
