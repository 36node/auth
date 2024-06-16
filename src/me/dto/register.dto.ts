import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { IsUsername } from 'src/common/validate';

export class RegisterUserByPhoneDto {
  /**
   * scope
   */
  @IsNotEmpty()
  @IsString()
  scope: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  dialingPrefix: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  password?: string;
}

export class RegisterUserByEmailDto {
  /**
   * scope
   */
  @IsNotEmpty()
  @IsString()
  scope: string;

  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  password?: string;
}

export class RegisterUserByUsernameDto {
  /**
   * scope
   */
  @IsNotEmpty()
  @IsString()
  scope: string;

  /**
   * 用户名
   */
  @IsNotEmpty()
  @IsUsername()
  @IsString()
  username: string;

  /**
   * 密码
   */
  @IsNotEmpty()
  @IsString()
  password: string;
}
