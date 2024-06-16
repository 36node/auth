import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';
import { isArray } from 'lodash';

import { isBoolean, toBoolean } from 'src/lib/lang/boolean';
import { isNumber } from 'src/lib/lang/number';
import { toUpperSnakeCase } from 'src/lib/lang/string';

// 先构造出.env*文件的绝对路径
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);
const pathsDotenv = resolveApp('.env');

dotenv.config({ path: `${pathsDotenv}.${process.env.NODE_ENV}` });
dotenv.config({ path: `${pathsDotenv}` });

/**
 * Read environment variables
 * @param settings
 * @param base
 */
export function env<T = Record<string, any>>(settings: T, base = ''): T {
  const result: any = isArray(settings) ? [] : {};
  for (const key in settings) {
    const envKey = base + toUpperSnakeCase(key);
    result[key] = settings[key];

    if (typeof settings[key] === 'object') {
      result[key] = env(settings[key], `${envKey}_`);
      continue;
    }

    const value = process.env[envKey];
    if (value === undefined) {
      continue;
    }

    if (isBoolean(value)) {
      result[key] = toBoolean(value);
    } else if (isNumber(value)) {
      result[key] = Number(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}
