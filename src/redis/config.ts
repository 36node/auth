import { loadEnv } from 'src/lib/utils/env';

export const url = loadEnv('REDIS_URL');
