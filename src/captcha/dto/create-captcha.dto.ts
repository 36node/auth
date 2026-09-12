import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

import { CaptchaKind } from '../captcha-policy.service';

export class CaptchaContextDto {
  @ApiProperty({ enum: CaptchaKind, enumName: 'CaptchaKind' })
  @IsEnum(CaptchaKind)
  kind: CaptchaKind;

  /** 服务端确定的用途，例如 login、register、reset_password、send_sms。 */
  @IsString()
  @Matches(/^[a-z][a-z0-9_.:-]{0,63}$/)
  purpose: string;

  /** 与账号查找规则一致的手机号、邮箱，或可信后端签发的匿名会话 ID。 */
  @IsString()
  @IsNotEmpty()
  @MaxLength(320)
  subject: string;
}

export class CreateCaptchaDto extends CaptchaContextDto {
  /** 仅 image 可指定答案；手机和邮箱验证码始终由 auth 生成。 */
  @ApiPropertyOptional({ pattern: '^[A-Za-z0-9]{4,8}$' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z0-9]{4,8}$/)
  code?: string;
}
