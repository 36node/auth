import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class VerifyCaptchaDto {
  /**
   * 验证码
   */
  @IsString()
  @IsNotEmpty()
  code: string;

  /**
   * 验证码 key
   */
  @IsNotEmpty()
  @IsString()
  key: string;
}

export class VerifyCaptchaResultDto {
  /**
   * 是否验证成功
   */
  @IsBoolean()
  success: boolean;
}
