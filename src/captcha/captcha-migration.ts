import { Db } from 'mongodb';

const legacyCaptcha = {
  $or: [
    { codeHash: { $exists: true } },
    { kind: { $exists: false } },
    { purpose: { $exists: false } },
    { subject: { $exists: false } },
  ],
};

/** Operates only on captcha and delivery-record collections; never reads message contents. */
export async function migrateCaptchaSecurity(db: Db, execute = false) {
  const captchas = db.collection('captchas');
  const sms = db.collection('smsrecords');
  const email = db.collection('emailrecords');
  const report = {
    legacyCaptchas: await captchas.countDocuments(legacyCaptcha),
    smsWithParams: await sms.countDocuments({ params: { $exists: true } }),
    emailsWithContent: await email.countDocuments({
      $or: [{ subject: { $exists: true } }, { content: { $exists: true } }],
    }),
    execute,
  };
  if (!execute) return report;
  await captchas.deleteMany(legacyCaptcha);
  await sms.updateMany({ params: { $exists: true } }, { $unset: { params: '' } });
  await email.updateMany(
    { $or: [{ subject: { $exists: true } }, { content: { $exists: true } }] },
    { $unset: { subject: '', content: '' } }
  );
  await captchas.createIndex({ key: 1 }, { unique: true });
  await captchas.createIndex({ kind: 1, purpose: 1, subject: 1 }, { unique: true });
  const ttl = (await captchas.listIndexes().toArray()).find(
    (index) => Object.keys(index.key).length === 1 && index.key.expireAt === 1
  );
  if (ttl && ttl.expireAfterSeconds !== 0) await captchas.dropIndex(ttl.name);
  await captchas.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 });
  return report;
}
