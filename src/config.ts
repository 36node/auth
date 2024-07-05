import { loadEnv } from './lib/utils/env';

export const port = loadEnv('PORT');
export const prefix = loadEnv('PREFIX') || '';
