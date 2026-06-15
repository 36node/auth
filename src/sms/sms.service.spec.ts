import { Test, TestingModule } from '@nestjs/testing';

import * as config from 'src/config';

import { SmsService } from './sms.service';

jest.mock('src/config', () => ({
  sms: {
    provider: 'volcengine',
    aliyun: { keyId: '', keySecret: '' },
    volcengine: {
      account: 'default-account',
      accessKeyId: 'key',
      secretKey: 'secret',
    },
  },
}));

const sendMock = jest.fn().mockResolvedValue({ ResponseMetadata: {} });

jest.mock('@volcengine/openapi/lib/services/sms', () => ({
  SmsService: jest.fn().mockImplementation(() => ({
    setAccessKeyId: jest.fn(),
    setSecretKey: jest.fn(),
    Send: sendMock,
  })),
}));

describe('SmsService', () => {
  let service: SmsService;

  beforeEach(async () => {
    sendMock.mockClear();
    const module: TestingModule = await Test.createTestingModule({
      providers: [SmsService],
    }).compile();
    service = module.get(SmsService);
  });

  it('uses account from dto when provided', async () => {
    await service.send({
      phone: '+8613800138000',
      sign: 'sign',
      template: 'tpl',
      account: 'foreign-account',
    });

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({ SmsAccount: 'foreign-account' })
    );
  });

  it('falls back to env default account when dto.account is omitted', async () => {
    await service.send({
      phone: '+8613800138000',
      sign: 'sign',
      template: 'tpl',
    });

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({ SmsAccount: config.sms.volcengine.account })
    );
  });
});
