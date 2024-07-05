import { IsEmail, IsMobilePhone, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { IsNs, IsPassword, IsUsername } from 'src/common/validate';

export class RegisterDto {
  /**
   * 用户名
   */
  @IsNotEmpty()
  @IsUsername()
  username: string;

  /**
   * 密码
   */
  @IsNotEmpty()
  @IsPassword()
  password: string;

  /**
   * 命名空间
   */
  @IsOptional()
  @IsNs()
  ns?: string;
}

export class RegisterbyPhoneDto {
  /**
   * 手机号
   */
  @IsNotEmpty()
  @IsMobilePhone('zh-CN')
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
   * 命名空间
   */
  @IsOptional()
  @IsNs()
  ns?: string;
}

export class RegisterByEmailDto {
  /**
   * 邮箱
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
   * 命名空间
   */
  @IsOptional()
  @IsNs()
  ns?: string;
}
