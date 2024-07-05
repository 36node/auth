import { snakeCase, toUpper } from 'lodash';

export const toUpperSnakeCase = (str: string) => toUpper(snakeCase(str));
