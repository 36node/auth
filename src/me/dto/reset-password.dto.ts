import { PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { UserDoc } from 'src/user';

export class ResetMyPasswordDto extends PickType(UserDoc, ['email', 'phone', 'dialingPrefix']) {
  /**
   * scope
   */
  @IsNotEmpty()
  @IsString()
  scope: string;

  /**
   * 验证码
   */
  @IsNotEmpty()
  @IsString()
  code: string;

  /**
   * 新密码
   */
  @IsNotEmpty()
  @IsString()
  newPassword: string;
}
