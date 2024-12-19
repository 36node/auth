import { IsEmail, IsMobilePhone, IsNotEmpty, IsString } from 'class-validator';

import { IsPassword } from 'src/common/validate';

export class ResetPasswordByPhoneDto {
  /**
   * 手机号
   */
  @IsNotEmpty()
  @IsMobilePhone('zh-CN') // 中国大陆地区手机号
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
