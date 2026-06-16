import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

import { IsPassword, IsPhone } from 'src/common/validate';

export class ResetPasswordByPhoneDto {
  /**
   * 手机号
   */
  @IsNotEmpty()
  @IsPhone()
  phone: string;

  /**
   * 验证码 key
   */
  @IsNotEmpty()
  @IsString()
  key: string;

  /**
   * 验证码 code
   */
  @IsNotEmpty()
  @IsString()
  code: string;

  /**
   * 密码
   */
  @IsNotEmpty()
  @IsPassword()
  password: string;
}

export class ResetPasswordByEmailDto {
  /**
   * 手机号
   */
  @IsNotEmpty()
  @IsEmail()
  email: string;

  /**
   * 验证码 key
   */
  @IsNotEmpty()
  @IsString()
  key: string;

  /**
   * 验证码 code
   */
  @IsNotEmpty()
  @IsString()
  code: string;

  /**
   * 密码
   */
  @IsNotEmpty()
  @IsPassword()
  password: string;
}
