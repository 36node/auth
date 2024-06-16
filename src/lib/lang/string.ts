import { snakeCase, toUpper } from 'lodash';

export const toUpperSnakeCase = (str: string) => toUpper(snakeCase(str));

export const getScope = (ns: string) => {
  let scope = ns;
  const index = ns.indexOf('/');
  if (index >= 0) {
    scope = ns.substring(0, index);
  }
  return scope;
};
