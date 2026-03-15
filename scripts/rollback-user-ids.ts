import 'dotenv/config';

import { MongoClient } from 'mongodb';

type CliOptions = {
  backupCollectionName?: string;
  keepCurrentUsers: boolean;
  confirm: boolean;
};

function parseArgs(): CliOptions {
  const backupArg = process.argv.find((arg) => arg.startsWith('--backup='));
  return {
    backupCollectionName: backupArg?.slice('--backup='.length),
    keepCurrentUsers: process.argv.includes('--keep-current-users'),
    confirm: process.argv.includes('--confirm'),
  };
}

function requireGuards(options: CliOptions) {
  if (!options.confirm) {
    throw new Error('Missing --confirm');
  }

  const maintenanceMode = process.env.USER_ID_MIGRATION_MAINTENANCE_MODE;
  if (maintenanceMode !== 'true') {
    throw new Error('USER_ID_MIGRATION_MAINTENANCE_MODE=true is required');
  }

  if (!options.backupCollectionName) {
    throw new Error('Missing required --backup=<backupCollectionName>');
  }
}

async function main() {
  const options = parseArgs();
  requireGuards(options);

  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    throw new Error('MONGO_URL is required');
  }

  const client = new MongoClient(mongoUrl);
  await client.connect();

  try {
    const db = client.db();
    const users = db.collection('users');
    const backupUsers = db.collection(options.backupCollectionName as string);

    const backupExists = await backupUsers.countDocuments({}, { limit: 1 });
    if (backupExists === 0) {
      throw new Error(`Backup collection not found or empty: ${options.backupCollectionName}`);
    }

    const currentUsersCollectionName = `users_failed_${Date.now()}`;

    await users.rename(currentUsersCollectionName);
    await backupUsers.rename('users');

    if (!options.keepCurrentUsers) {
      await db.collection(currentUsersCollectionName).drop();
    }

    console.log(
      JSON.stringify(
        {
          mode: 'rollback',
          restoredFrom: options.backupCollectionName,
          keepCurrentUsers: options.keepCurrentUsers,
          currentUsersCollectionName,
          ok: true,
        },
        null,
        2
      )
    );
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
