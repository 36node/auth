import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

import { errCodes } from './err-code';

export type ValidationErrorDetail = {
  message: string;
  field: string;
};

const buildErrorDetail = (
  errors: ValidationError[],
  details: ValidationErrorDetail[],
  propertyBasePath = ''
) => {
  errors.forEach((error) => {
    if (error.constraints) {
      Object.values(error.constraints).forEach((message) => {
        details.push({
          message,
          field: propertyBasePath + error.property,
        });
      });
    } else {
      buildErrorDetail(error.children, details, `${propertyBasePath}${error.property}.`);
    }
  });
};

export const exceptionFactory = (errors: ValidationError[]) => {
  const details = [];
  buildErrorDetail(errors, details);
  return new BadRequestException({
    status: 400,
    code: errCodes.VALIDATE_FAILED,
    message: 'Invalid data',
    details: details.length ? details : undefined,
  });
};
