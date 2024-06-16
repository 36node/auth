import { PickType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginSessionDto {
  /**
   * scope
   */
  @IsNotEmpty()
  @IsString()
  scope: string;

  /**
   * 用户名 或者 Email
   */
  @IsNotEmpty()
  @IsString()
  login: string;

  /**
   * 密码
   */
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class LoginSessionByPhoneDto extends PickType(LoginSessionDto, ['scope'] as const) {
  /**
   * 手机号
   */
  @IsNotEmpty()
  @IsString()
  phone: string;

  /**
   * 验证码
   */
  @IsNotEmpty()
  @IsString()
  code: string;

  /**
   * 区号
   */
  @IsNotEmpty()
  @IsString()
  dialingPrefix: string;
}

export class LoginSessionByEmailDto extends PickType(LoginSessionDto, ['scope'] as const) {
  /**
   * 邮箱
   */
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;

  /**
   * 验证码
   */
  @IsNotEmpty()
  @IsString()
  code: string;
}
