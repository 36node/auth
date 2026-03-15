import 'dotenv/config';

import { MongoClient } from 'mongodb';

type CliOptions = {
  dryRun: boolean;
  keepBackup: boolean;
  confirm: boolean;
};

function parseArgs(): CliOptions {
  return {
    dryRun: process.argv.includes('--dry-run'),
    keepBackup: process.argv.includes('--keep-backup'),
    confirm: process.argv.includes('--confirm'),
  };
}

function requireSafeExecutionGuards(options: CliOptions) {
  if (options.dryRun) return;

  const maintenanceMode = process.env.USER_ID_MIGRATION_MAINTENANCE_MODE;
  if (maintenanceMode !== 'true') {
    throw new Error('USER_ID_MIGRATION_MAINTENANCE_MODE=true is required for apply mode');
  }

  if (!options.confirm) {
    throw new Error('Missing --confirm for apply mode');
  }
}

async function verifyReferences(db: any) {
  const users = db.collection('users');
  const thirdParties = db.collection('thirdparties');
  const sessions = db.collection('sessions');

  const userIds = await users.distinct('_id');
  const danglingThirdParty = await thirdParties.countDocuments({
    uid: { $exists: true, $nin: userIds },
  });
  const danglingSessions = await sessions.countDocuments({
    $or: [{ source: null }, { source: { $exists: false } }],
    subject: { $nin: userIds },
  });
  const danglingInviter = await users.countDocuments({
    inviter: { $exists: true, $nin: userIds },
  });

  return {
    danglingThirdParty,
    danglingSessions,
    danglingInviter,
    ok: danglingThirdParty === 0 && danglingSessions === 0 && danglingInviter === 0,
  };
}

async function main() {
  const options = parseArgs();
  requireSafeExecutionGuards(options);

  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    throw new Error('MONGO_URL is required');
  }

  const client = new MongoClient(mongoUrl);
  await client.connect();

  try {
    const db = client.db();
    const users = db.collection('users');
    const totalUsers = await users.countDocuments();

    const duplicateTargetIds = await users
      .aggregate([
        {
          $project: {
            targetId: {
              $cond: [{ $eq: [{ $type: '$_id' }, 'objectId'] }, { $toString: '$_id' }, '$_id'],
            },
          },
        },
        { $group: { _id: '$targetId', count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } },
      ])
      .toArray();

    if (duplicateTargetIds.length > 0) {
      throw new Error(`Duplicate target ids detected: ${duplicateTargetIds.length}`);
    }

    if (options.dryRun) {
      console.log(JSON.stringify({ totalUsers, mode: 'dry-run', ok: true }, null, 2));
      return;
    }

    const timestamp = Date.now();
    const temporaryCollectionName = `users_string_id_tmp_${timestamp}`;
    const backupCollectionName = `users_backup_${timestamp}`;

    await users
      .aggregate([
        {
          $addFields: {
            _id: {
              $cond: [{ $eq: [{ $type: '$_id' }, 'objectId'] }, { $toString: '$_id' }, '$_id'],
            },
          },
        },
        { $out: temporaryCollectionName },
      ])
      .toArray();

    const temporaryCollection = db.collection(temporaryCollectionName);

    const migratedCount = await temporaryCollection.countDocuments();
    if (migratedCount !== totalUsers) {
      throw new Error(`Migrated user count mismatch: ${migratedCount} !== ${totalUsers}`);
    }

    await users.rename(backupCollectionName);
    await temporaryCollection.rename('users');

    const integrity = await verifyReferences(db);
    if (!integrity.ok) {
      throw new Error(`Reference integrity check failed: ${JSON.stringify(integrity)}`);
    }

    if (!options.keepBackup) {
      await db.collection(backupCollectionName).drop();
    }

    console.log(
      JSON.stringify(
        {
          totalUsers,
          migratedCount,
          mode: 'apply',
          keepBackup: options.keepBackup,
          backupCollectionName,
          integrity,
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
