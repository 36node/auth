import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { migrateCaptchaSecurity } from './captcha-migration';

describe('Captcha security migration', () => {
  it('supports read-only reporting, clears only legacy secrets, and is idempotent', async () => {
    const mongod = await MongoMemoryServer.create();
    const client = await MongoClient.connect(mongod.getUri());
    try {
      const db = client.db('migration');
      await db.collection('captchas').insertMany([
        { key: 'legacy', code: '123456', expireAt: new Date(Date.now() + 300000) },
        {
          key: 'new',
          kind: 'sms',
          purpose: 'login',
          subject: 'subject',
          code: '654321',
          status: 'pending',
          expireAt: new Date(Date.now() + 300000),
        },
        {
          key: 'legacy-hash',
          kind: 'sms',
          purpose: 'login',
          subject: 'legacy-subject',
          codeHash: 'hash',
          status: 'pending',
          expireAt: new Date(Date.now() + 300000),
        },
        {
          key: 'new-used',
          kind: 'sms',
          purpose: 'login',
          subject: 'used-subject',
          status: 'used',
          expireAt: new Date(Date.now() + 300000),
        },
      ]);
      await db.collection('captchas').createIndex({ expireAt: 1 }, { expireAfterSeconds: 604800 });
      await db
        .collection('smsrecords')
        .insertOne({ phone: 'subject', params: 'secret-sms', status: 'sent' });
      await db.collection('emailrecords').insertOne({
        to: 'subject',
        subject: 'secret-title',
        content: 'secret-body',
        status: 'sent',
      });
      await db.collection('users').insertOne({ username: 'untouched' });
      const report = await migrateCaptchaSecurity(db);
      expect(report).toMatchObject({
        execute: false,
        legacyCaptchas: 2,
        smsWithParams: 1,
        emailsWithContent: 1,
      });
      expect(await db.collection('captchas').countDocuments({})).toBe(4);
      expect(await db.collection('smsrecords').findOne({})).toHaveProperty('params');
      await migrateCaptchaSecurity(db, true);
      expect(await db.collection('captchas').countDocuments({})).toBe(2);
      expect(await db.collection('captchas').findOne({ key: 'new' })).toHaveProperty(
        'code',
        '654321'
      );
      expect(await db.collection('captchas').findOne({ key: 'new-used' })).toHaveProperty(
        'status',
        'used'
      );
      expect(await db.collection('smsrecords').findOne({})).not.toHaveProperty('params');
      expect(await db.collection('emailrecords').findOne({})).not.toHaveProperty('content');
      expect(await db.collection('emailrecords').findOne({})).not.toHaveProperty('subject');
      expect(await db.collection('users').findOne({})).toHaveProperty('username', 'untouched');
      const indexes = await db.collection('captchas').indexes();
      expect(indexes.find((index) => index.key.expireAt === 1).expireAfterSeconds).toBe(0);
      expect(indexes.find((index) => index.key.subject === 1).unique).toBe(true);
      expect(await migrateCaptchaSecurity(db, true)).toMatchObject({
        legacyCaptchas: 0,
        smsWithParams: 0,
        emailsWithContent: 0,
      });
      expect(await db.collection('captchas').countDocuments({})).toBe(2);
    } finally {
      await client.close();
      await mongod.stop();
    }
  });
});
