import { Command } from 'commander';
import { MongoClient } from 'mongodb';

import { migrateCaptchaSecurity } from '../src/captcha/captcha-migration';
import * as config from '../src/config';

async function main() {
  const program = new Command()
    .description('Count legacy captcha/message fields; --execute removes them and updates indexes.')
    .option('--execute', 'apply migration after pausing old writers')
    .parse();
  const { execute = false } = program.opts();
  if (execute && process.env.CAPTCHA_MAINTENANCE_MODE !== 'true') {
    throw new Error(
      'Pause captcha/related delivery traffic and old writers, then set CAPTCHA_MAINTENANCE_MODE=true.'
    );
  }
  const client = new MongoClient(config.mongo.url, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    console.log(JSON.stringify(await migrateCaptchaSecurity(client.db(), execute), null, 2));
  } finally {
    await client.close();
  }
}

main().catch(() => {
  console.error(
    'Captcha migration failed. Check maintenance mode, connection and index permissions; no sensitive data is logged.'
  );
  process.exitCode = 1;
});
