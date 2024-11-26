import { loadEnv } from 'src/lib/utils/env';

export const mongoTestBaseUrl = loadEnv('MONGO_TEST_BASE_URL', {
  default: 'mongodb://localhost:27017',
});
