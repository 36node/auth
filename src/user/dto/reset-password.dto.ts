import { IsNotEmpty } from 'class-validator';

import { IsPassword } from 'src/common/validate';

export class ResetPasswordDto {
  /**
   * 密码
   */
  @IsNotEmpty()
  @IsPassword()
  password?: string;
}
