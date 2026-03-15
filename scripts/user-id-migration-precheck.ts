import 'dotenv/config';

import { MongoClient, ObjectId } from 'mongodb';

function getTargetUserId(id: string | ObjectId): string {
  if (id instanceof ObjectId) return id.toString();
  return id;
}

async function main() {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    throw new Error('MONGO_URL is required');
  }

  const client = new MongoClient(mongoUrl);
  await client.connect();

  try {
    const db = client.db();
    const users = db.collection('users');
    const thirdParties = db.collection('thirdparties');
    const sessions = db.collection('sessions');

    const userDocs = await users.find({}, { projection: { _id: 1, inviter: 1 } }).toArray();
    const targetIds = userDocs.map((doc) => getTargetUserId(doc._id as string | ObjectId));
    const duplicates = targetIds.filter((id, index) => targetIds.indexOf(id) !== index);

    if (duplicates.length > 0) {
      throw new Error(
        `Duplicate target user ids detected: ${Array.from(new Set(duplicates)).join(', ')}`
      );
    }

    const idSet = new Set(targetIds);
    const danglingThirdParty = await thirdParties.countDocuments({
      uid: { $exists: true, $nin: Array.from(idSet) },
    });
    const danglingSessions = await sessions.countDocuments({
      $or: [{ source: null }, { source: { $exists: false } }],
      subject: { $nin: Array.from(idSet) },
    });
    const danglingInviter = userDocs.filter(
      (doc) => typeof doc.inviter === 'string' && !idSet.has(doc.inviter)
    ).length;

    const summary = {
      totalUsers: userDocs.length,
      legacyObjectIdUsers: userDocs.filter((doc) => doc._id instanceof ObjectId).length,
      existingStringUsers: userDocs.filter((doc) => typeof doc._id === 'string').length,
      danglingThirdParty,
      danglingSessions,
      danglingInviter,
      ok: danglingThirdParty === 0 && danglingSessions === 0 && danglingInviter === 0,
    };

    console.log(JSON.stringify(summary, null, 2));

    if (!summary.ok) {
      throw new Error('Precheck failed: unresolved user references exist.');
    }
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
