import { loadEnv } from 'src/lib/utils/env';

export const url = loadEnv('MONGO_URL');
