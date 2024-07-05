import { IsNotEmpty, IsOptional } from 'class-validator';

import { IsPassword } from 'src/common/validate';

export class UpdatePasswordDto {
  /**
   * 旧密码
   */
  @IsOptional()
  @IsPassword()
  oldPassword?: string;

  /**
   * 新密码
   */
  @IsNotEmpty()
  @IsPassword()
  newPassword: string;
}
