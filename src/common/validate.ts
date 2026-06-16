import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function IsNonPrimitiveArray(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsNonPrimitiveArray',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          return (
            Array.isArray(value) &&
            value.reduce((a, b) => a && typeof b === 'object' && !Array.isArray(b), true)
          );
        },
      },
    });
  };
}

export function isNs(value: any): boolean {
  const regex = /^[a-zA-Z][a-zA-Z0-9._/-]{0,200}$/;
  return typeof value === 'string' && regex.test(value);
}

/**
 * 验证 ns 格式
 * @param validationOptions
 * @returns
 */
export function IsNs(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isNs',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(value: any) {
          return isNs(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must match the regex /^[a-zA-Z][a-zA-Z0-9._/-]{0,200}$/`;
        },
      },
    });
  };
}

/** 中国手机号：1 开头，第二位 3-9，允许连字符/空格 */
const CN_PHONE = /^1[3-9][\d\s-]{9,11}$/;

/** 国际号码：+ 开头，后跟数字及常见分隔符 */
const INTL_PHONE = /^\+\d[\d\s-]{5,20}$/;

export function isPhone(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  const s = value.trim();
  if (CN_PHONE.test(s)) {
    return s.replace(/[\s-]/g, '').length === 11;
  }
  return INTL_PHONE.test(s);
}

export type LoginField = 'email' | 'phone' | 'username';

/**
 * 根据 login 字符串判定登录字段类型（email / phone / username）
 */
export function detectLoginField(login: string): LoginField {
  if (login.includes('@')) {
    return 'email';
  }
  if (isPhone(login)) {
    return 'phone';
  }
  return 'username';
}

/**
 * 验证 phone 格式
 */
export function IsPhone(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isPhone',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(value: any) {
          return value ? isPhone(value) : true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid phone number (CN mobile or international + prefix)`;
        },
      },
    });
  };
}

export function isUserName(value: any): boolean {
  const regex = /^[a-zA-Z][a-zA-Z0-9_.-]{1,63}$/;
  return typeof value === 'string' && regex.test(value);
}

/**
 * 验证 username 格式
 * @param validationOptions
 * @returns
 */
export function IsUsername(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isUsername',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(value: any) {
          return value ? isUserName(value) : true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must match the regex /^[a-zA-Z][a-zA-Z0-9_.-]{1,63}$/`;
        },
      },
    });
  };
}

export function isPassword(value: any): boolean {
  const regex =
    /^(?=(?:.*[A-Z]){1})(?=(?:.*[a-z]){1})(?=(?:.*[0-9]){1}|(?:.*[\W_]){1}).{8,}$|^(?=(?:.*[A-Z]){1})(?=(?:.*[\W_]){1})(?=(?:.*[0-9]){1}|(?:.*[a-z]){1}).{8,}$|^(?=(?:.*[a-z]){1})(?=(?:.*[\W_]){1})(?=(?:.*[0-9]){1}|(?:.*[A-Z]){1}).{8,}$|^(?=(?:.*[0-9]){1})(?=(?:.*[\W_]){1})(?=(?:.*[a-z]){1}|(?:.*[A-Z]){1}).{8,}$/;
  return typeof value === 'string' && regex.test(value);
}

/**
 * 验证 username 格式
 * @param validationOptions
 * @returns
 */
export function IsPassword(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(value: any) {
          return value ? isPassword(value) : true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be at least 8 characters long, and contain at least three of the following: uppercase letters, lowercase letters, numbers, or special characters.`;
        },
      },
    });
  };
}

/**
 * 验证 RegExp 格式
 * @param validationOptions
 * @returns
 */
export function IsRegExp(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isRegExp',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(value: any) {
          try {
            new RegExp(value);
            return true;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (e) {
            return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must match regex format`;
        },
      },
    });
  };
}
