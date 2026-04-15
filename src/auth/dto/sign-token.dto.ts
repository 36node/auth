import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

import { Acl } from 'src/auth/entities/jwt.entity';

export class SignTokenDto {
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
   * 用户 id
   */
  @IsNotEmpty()
  @IsString()
  uid: string;

  /**
   * 受限权限
   */
  @IsOptional()
  @IsString({ each: true })
  permissions?: string[];

  /**
   * 访问控制列表
   */
  @IsOptional()
  @IsObject()
  acl?: Acl;
}
