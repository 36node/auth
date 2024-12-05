import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  /**
   * 可以是 username/phone/Email
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

export class LoginByPhoneDto {
  /**
   * 手机号
   */
  @IsNotEmpty()
  @IsString()
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
}

export class LoginByEmailDto {
  /**
   * 邮箱
   */
  @IsNotEmpty()
  @IsEmail()
  @IsString()
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
}

export class LogoutDto {
  /**
   * session refreshToken
   */
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
