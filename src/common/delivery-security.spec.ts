import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, createConnection } from 'mongoose';
import request from 'supertest';

import { EmailRecordController } from 'src/email/email-record.controller';
import { EmailRecordService } from 'src/email/email-record.service';
import { EmailController } from 'src/email/email.controller';
import { EmailService } from 'src/email/email.service';
import { EmailRecord, EmailRecordSchema } from 'src/email/entities/email-record.entity';
import { SmsRecord, SmsRecordSchema } from 'src/sms/entities/sms-record.entity';
import { SmsRecordController } from 'src/sms/sms-record.controller';
import { SmsRecordService } from 'src/sms/sms-record.service';
import { SmsController } from 'src/sms/sms.controller';
import { SmsService } from 'src/sms/sms.service';

import { RouteLoggerMiddleware } from './route-logger.middleware';

const smsSecret = 'secret-sms-092712';
const emailSecret = 'secret-email-title-810234';
const bodySecret = 'secret-email-body-809123';

describe('Delivery metadata security', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let connection: Connection;
  const sms = {
    send: jest.fn().mockResolvedValue(undefined),
    resolveAccount: jest.fn().mockReturnValue('account'),
  };
  const email = { sendEmail: jest.fn().mockResolvedValue(undefined) };
  const smsBody = {
    phone: '13800138000',
    sign: 'sign',
    template: 'template',
    params: { code: smsSecret },
  };
  const emailBody = {
    from: 'sender@example.com',
    to: 'recipient@example.com',
    subject: emailSecret,
    content: bodySecret,
  };
  let logs: any[];

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    connection = await createConnection(mongod.getUri()).asPromise();
    const fixture = await Test.createTestingModule({
      controllers: [SmsController, EmailController, SmsRecordController, EmailRecordController],
      providers: [
        SmsRecordService,
        EmailRecordService,
        {
          provide: getModelToken(SmsRecord.name),
          useValue: connection.model(SmsRecord.name, SmsRecordSchema),
        },
        {
          provide: getModelToken(EmailRecord.name),
          useValue: connection.model(EmailRecord.name, EmailRecordSchema),
        },
        { provide: SmsService, useValue: sms },
        { provide: EmailService, useValue: email },
      ],
    }).compile();
    app = fixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });
  beforeEach(() => {
    logs = [];
    for (const level of ['log', 'error', 'warn'] as const)
      jest.spyOn(Logger.prototype, level).mockImplementation((...args: any[]) => {
        logs.push(args);
      });
  });
  afterEach(async () => {
    jest.restoreAllMocks();
    sms.send.mockClear();
    email.sendEmail.mockClear();
    await connection.collection('smsrecords').deleteMany({});
    await connection.collection('emailrecords').deleteMany({});
  });
  afterAll(async () => {
    await app?.close();
    await connection?.close();
    await mongod?.stop();
  });

  it('sends full content while persisting and returning metadata only', async () => {
    await request(app.getHttpServer()).post('/sms/@sendSms').send(smsBody).expect(204);
    await request(app.getHttpServer()).post('/email/@sendEmail').send(emailBody).expect(204);
    expect(sms.send).toHaveBeenCalledWith(expect.objectContaining(smsBody));
    expect(email.sendEmail).toHaveBeenCalledWith(expect.objectContaining(emailBody));
    const stored = [
      await connection.collection('smsrecords').findOne({}),
      await connection.collection('emailrecords').findOne({}),
    ];
    const responses = [
      await request(app.getHttpServer()).get('/sms/records').expect(200),
      await request(app.getHttpServer()).get('/email/records').expect(200),
    ];
    const serialized = JSON.stringify({ stored, logs, responses: responses.map((r) => r.body) });
    for (const secret of [smsSecret, emailSecret, bodySecret])
      expect(serialized).not.toContain(secret);
  });

  it('prevents record CRUD from storing content and hides unmigrated historical fields', async () => {
    for (const [domain, payload, collection] of [
      ['sms', { ...smsBody, params: smsSecret, status: 'sent' }, 'smsrecords'],
      ['email', { ...emailBody, status: 'sent' }, 'emailrecords'],
    ] as const) {
      const created = await request(app.getHttpServer())
        .post(`/${domain}/records`)
        .send(payload)
        .expect(201);
      await request(app.getHttpServer())
        .patch(`/${domain}/records/${created.body.id}`)
        .send(payload)
        .expect(200);
      const stored = await connection.collection(collection).findOne({});
      expect(stored).not.toHaveProperty('params');
      expect(stored).not.toHaveProperty('content');
      expect(stored).not.toHaveProperty('subject');
      await connection
        .collection(collection)
        .updateOne(
          { _id: stored._id },
          { $set: { params: smsSecret, subject: emailSecret, content: bodySecret } }
        );
      const detail = await request(app.getHttpServer())
        .get(`/${domain}/records/${created.body.id}`)
        .expect(200);
      const list = await request(app.getHttpServer())
        .get(`/${domain}/records`)
        .query({ _select: '+params +content +subject' })
        .expect(200);
      for (const secret of [smsSecret, emailSecret, bodySecret])
        expect(JSON.stringify([detail.body, list.body])).not.toContain(secret);
    }
  });

  it('does not expose complete provider exceptions in logs or HTTP errors', async () => {
    const failure = new Error(`${smsSecret} ${emailSecret} ${bodySecret}`);
    sms.send.mockRejectedValueOnce(failure);
    email.sendEmail.mockRejectedValueOnce(failure);
    const a = await request(app.getHttpServer()).post('/sms/@sendSms').send(smsBody).expect(500);
    const b = await request(app.getHttpServer())
      .post('/email/@sendEmail')
      .send(emailBody)
      .expect(500);
    for (const secret of [smsSecret, emailSecret, bodySecret])
      expect(JSON.stringify([a.body, b.body, logs])).not.toContain(secret);
  });

  it('does not log request credentials or query values', () => {
    const middleware = new RouteLoggerMiddleware();
    let finish: () => void;
    middleware.use(
      {
        ip: '127.0.0.1',
        method: 'POST',
        originalUrl: `/captchas?code=${smsSecret}`,
        headers: { 'authorization': bodySecret, 'x-api-key': emailSecret },
        get: () => 'test-agent',
      } as any,
      {
        on: (_name: string, handler: () => void) => {
          finish = handler;
        },
        get: () => '0',
        statusCode: 200,
      } as any,
      () => undefined
    );
    finish();
    for (const secret of [smsSecret, emailSecret, bodySecret])
      expect(JSON.stringify(logs)).not.toContain(secret);
  });
});
