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

export function isUserName(value: any): boolean {
  const regex = /^[a-zA-Z][a-zA-Z0-9_.-]{2,63}$/;
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
          return `${args.property} must match the regex /^[a-zA-Z][a-zA-Z0-9_.-]{2,63}$/`;
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
