export class VerifyCaptchaDto {
  /**
   * 验证码
   */
  code: string;

  /**
   * 验证码 key
   */
  key: string;
}

export class VerifyCaptchaResultDto {
  /**
   * 是否验证成功
   */
  success: boolean;
}
