import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendEmailDto {
  /**
   * 发件人地址，支持纯邮箱或带显示名格式，例如 `robot@mail.36node.com` 或 `"robot" <robot@mail.36node.com>`
   */
  @IsNotEmpty()
  @IsEmail({ allow_display_name: true })
  from: string;

  @IsNotEmpty()
  @IsEmail()
  to: string;

  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsBoolean()
  useHtml?: boolean;
}
