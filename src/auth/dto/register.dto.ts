import { ApiPropertyOptional, IntersectionType, OmitType } from '@nestjs/swagger';
import { IsEmail, IsIP, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

import { IsNs, IsPassword, IsPhone, IsUsername } from 'src/common/validate';

import { CodeAuthDto } from './code-auth.dto';

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

export class RegisterbyPhoneDto {
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

export class RegisterByCodeDto extends IntersectionType(
  CodeAuthDto,
  OmitType(RegisterbyPhoneDto, ['phone', 'key', 'code'] as const)
) {
  /** 可选密码；提供时必须满足现有密码强度要求 */
  @ApiPropertyOptional({ type: String, writeOnly: true })
  @ValidateIf((_object, value) => value !== undefined)
  @IsNotEmpty()
  @IsString()
  @IsPassword()
  password?: string;
}
