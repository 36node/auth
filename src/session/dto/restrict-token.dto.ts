import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { Acl } from 'src/auth';

export class RestrictTokenDto {
  /**
   * short time span string
   *
   * refs: https://github.com/vercel/ms
   *
   * eg: "2 days", "10h", "7d", "120s", "2.5 hrs", "2h", "1m", "5s", "1y", "100", "1y1m1d"
   *
   * m => minute
   * h => hour
   * d => day
   * w => week
   * M => month
   * y => year
   * s => second
   * ms => millisecond
   * 无单位 => millisecond
   */
  @IsNotEmpty()
  @IsString()
  expiresIn: string;

  /**
   * 访问控制列表
   */
  @IsOptional()
  acl?: Acl;

  /**
   * refresh token key
   */
  @IsNotEmpty()
  @IsString()
  key: string;

  /**
   * 命名空间约束，只能是 token 的同级或者下一级
   */
  @IsOptional()
  @IsString()
  ns?: string;
}
