import { IsBoolean, IsEmail, IsIP, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { IsNs } from 'src/common/validate';

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

  /**
   * 不存在用户时是否自动注册
   */
  @IsOptional()
  @IsBoolean()
  autoRegister?: boolean;

  /**
   * 自动注册时是否启用（不传则使用服务端默认）
   */
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  /**
   * 自动注册时的角色（不传则使用服务端默认）
   */
  @IsOptional()
  @IsString({ each: true })
  roles?: string[];

  /**
   * 命名空间
   */
  @IsOptional()
  @IsNs()
  ns?: string;

  /**
   * 邀请人
   */
  @IsOptional()
  @IsString()
  inviter?: string;

  /**
   * 标签
   */
  @IsOptional()
  @IsString({ each: true })
  labels?: string[];

  /**
   * 注册 IP
   */
  @IsOptional()
  @IsIP()
  registerIp?: string;

  /**
   * 注册地区，存地区编号
   */
  @IsOptional()
  @IsString()
  registerRegion?: string;

  /**
   * 类型, 登录端
   */
  @IsOptional()
  @IsString()
  type?: string;
}

export class LoginByPhoneQuickAuthDto {
  /**
   * 快速认证令牌
   */
  @IsNotEmpty()
  @IsString()
  token: string;

  /**
   * 不存在用户时是否自动注册
   */
  @IsOptional()
  @IsBoolean()
  autoRegister?: boolean;

  /**
   * 自动注册时是否启用（不传则使用服务端默认）
   */
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  /**
   * 自动注册时的角色（不传则使用服务端默认）
   */
  @IsOptional()
  @IsString({ each: true })
  roles?: string[];

  /**
   * 命名空间
   */
  @IsOptional()
  @IsNs()
  ns?: string;

  /**
   * 邀请人
   */
  @IsOptional()
  @IsString()
  inviter?: string;

  /**
   * 标签
   */
  @IsOptional()
  @IsString({ each: true })
  labels?: string[];

  /**
   * 注册 IP
   */
  @IsOptional()
  @IsIP()
  registerIp?: string;

  /**
   * 注册地区，存地区编号
   */
  @IsOptional()
  @IsString()
  registerRegion?: string;

  /**
   * 类型, 登录端
   */
  @IsOptional()
  @IsString()
  type?: string;
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

  /**
   * 不存在用户时是否自动注册
   */
  @IsOptional()
  @IsBoolean()
  autoRegister?: boolean;

  /**
   * 自动注册时是否启用（不传则使用服务端默认）
   */
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  /**
   * 自动注册时的角色（不传则使用服务端默认）
   */
  @IsOptional()
  @IsString({ each: true })
  roles?: string[];

  /**
   * 命名空间
   */
  @IsOptional()
  @IsNs()
  ns?: string;

  /**
   * 邀请人
   */
  @IsOptional()
  @IsString()
  inviter?: string;

  /**
   * 标签
   */
  @IsOptional()
  @IsString({ each: true })
  labels?: string[];

  /**
   * 注册 IP
   */
  @IsOptional()
  @IsIP()
  registerIp?: string;

  /**
   * 注册地区，存地区编号
   */
  @IsOptional()
  @IsString()
  registerRegion?: string;

  /**
   * 类型, 登录端
   */
  @IsOptional()
  @IsString()
  type?: string;
}

export class LogoutDto {
  /**
   * session id
   */
  @IsNotEmpty()
  @IsString()
  sid: string;
}
