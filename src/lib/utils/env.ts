import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';

import { CustomError } from './error';

type LoadEnvOptions = {
  required?: boolean;
  default?: string;
};

// 先构造出.env*文件的绝对路径
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath: string) => path.resolve(appDirectory, relativePath);
const pathsDotenv = resolveApp('.env');

dotenv.config({ path: `${pathsDotenv}.${process.env.NODE_ENV}` });
dotenv.config({ path: `${pathsDotenv}` });

class LoadEnvError extends CustomError {
  constructor(message: string) {
    super(message);
    this.name = 'LoadEnvError';
  }
}

export const loadEnv = (key: string, opts: LoadEnvOptions = {}) => {
  const val = process.env[key] ?? opts.default;
  if (!val && opts.required) {
    throw new LoadEnvError(`Missing required environment variable: ${key}`);
  }
  return val;
};
