import { ApiProperty } from '@nestjs/swagger';
import {
  isEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  registerDecorator,
  ValidationArguments,
} from 'class-validator';

import { isPhone } from 'src/common/validate';

export enum CodeAuthChannel {
  SMS = 'sms',
  EMAIL = 'email',
}

function IsCodeAccount() {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isCodeAccount',
      target: object.constructor,
      propertyName,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const { channel } = args.object as CodeAuthDto;
          if (channel === CodeAuthChannel.SMS) return isPhone(value);
          return channel === CodeAuthChannel.EMAIL && typeof value === 'string' && isEmail(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid phone number for sms or email address for email`;
        },
      },
    });
  };
}

export class CodeAuthDto {
  /** 验证码渠道：sms 或 email */
  @ApiProperty({ enum: CodeAuthChannel })
  @IsEnum(CodeAuthChannel)
  channel: CodeAuthChannel;

  /** 实际手机号或邮箱，与签发验证码时的 subject 完全一致 */
  @IsNotEmpty()
  @IsString()
  @IsCodeAccount()
  account: string;

  /** 验证码 key */
  @IsNotEmpty()
  @IsString()
  key: string;

  /** 验证码答案 */
  @IsNotEmpty()
  @IsString()
  code: string;
}
