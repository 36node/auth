import { randomBytes, randomInt, timingSafeEqual } from 'crypto';

import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult } from 'mongodb';
import { Model } from 'mongoose';

import { ErrorCodes } from 'src/constants';
import { buildMongooseQuery } from 'src/mongo';

import { CaptchaKind, CaptchaPolicyService } from './captcha-policy.service';
import { CaptchaRateLimitService } from './captcha-rate-limit.service';
import { CreateCaptchaDto } from './dto/create-captcha.dto';
import { ListCaptchasQuery } from './dto/list-captchas.dto';
import { VerifyCaptchaDto } from './dto/verify-captcha.dto';
import { Captcha, CaptchaDocument, CaptchaStatus, IssuedCaptcha } from './entities/captcha.entity';

const DB_TIMEOUT_MS = 2000;
const METADATA =
  'key kind purpose subject expireAt maxAttempts failedAttempts status createdAt updatedAt';

@Injectable()
export class CaptchaService {
  private readonly logger = new Logger(CaptchaService.name);

  constructor(
    @InjectModel(Captcha.name) private readonly captchaModel: Model<CaptchaDocument>,
    private readonly policy: CaptchaPolicyService,
    private readonly limiter: CaptchaRateLimitService
  ) {}

  private metadata(doc: any): Captcha {
    return {
      id: String(doc._id ?? doc.id),
      key: doc.key,
      kind: doc.kind,
      purpose: doc.purpose,
      subject: doc.subject,
      expireAt: doc.expireAt,
      maxAttempts: doc.maxAttempts,
      failedAttempts: doc.failedAttempts,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  private async database<T>(operation: () => Promise<T>): Promise<T> {
    let timer: ReturnType<typeof setTimeout>;
    try {
      return await Promise.race([
        operation(),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error()), DB_TIMEOUT_MS);
        }),
      ]);
    } catch {
      this.logger.error({ event: 'captcha_dependency_failed', dependency: 'mongo' });
      throw new ServiceUnavailableException({
        code: ErrorCodes.CAPTCHA_UNAVAILABLE,
        message: 'Captcha service unavailable.',
      });
    } finally {
      clearTimeout(timer);
    }
  }

  async create(dto: CreateCaptchaDto): Promise<IssuedCaptcha> {
    if (
      (dto.kind !== CaptchaKind.IMAGE && dto.code !== undefined) ||
      (dto.code !== undefined && !/^[A-Za-z0-9]{4,8}$/.test(dto.code))
    ) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATE_FAILED,
        message: 'Only image captchas accept a 4-8 character alphanumeric answer.',
      });
    }
    await this.limiter.reserve(dto.kind, dto.subject, 'issue');
    const policy = this.policy.policies[dto.kind];
    const alphabet = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
    const code =
      dto.kind === CaptchaKind.IMAGE
        ? (dto.code?.toUpperCase() ??
          Array.from({ length: 4 }, () => alphabet[randomInt(alphabet.length)]).join(''))
        : randomInt(1000000).toString().padStart(6, '0');
    const key = randomBytes(16).toString('hex');
    const scope = { kind: dto.kind, purpose: dto.purpose, subject: dto.subject };
    const payload = {
      ...scope,
      key,
      code,
      expireAt: new Date(Date.now() + policy.expiresInS * 1000),
      maxAttempts: policy.maxAttempts,
      failedAttempts: 0,
      status: CaptchaStatus.PENDING,
    };
    const doc = await this.database(async () => {
      try {
        return await this.captchaModel
          .findOneAndUpdate(scope, { $set: payload }, { upsert: true, new: true })
          .select(METADATA)
          .maxTimeMS(DB_TIMEOUT_MS)
          .lean()
          .exec();
      } catch (error) {
        // Two initial upserts may race on the scope index. Retry only that collision.
        if (error.code !== 11000 || !error.keyPattern?.subject) throw error;
        return this.captchaModel
          .findOneAndUpdate(scope, { $set: payload }, { new: true })
          .select(METADATA)
          .maxTimeMS(DB_TIMEOUT_MS)
          .lean()
          .exec();
      }
    });
    if (!doc)
      throw new ServiceUnavailableException({
        code: ErrorCodes.CAPTCHA_UNAVAILABLE,
        message: 'Captcha service unavailable.',
      });
    this.logger.log({ event: 'captcha_issued', kind: dto.kind });
    return { ...this.metadata(doc), code };
  }

  async consume(dto: VerifyCaptchaDto): Promise<boolean> {
    await this.limiter.reserve(dto.kind, dto.subject, 'verify');
    const code = dto.kind === CaptchaKind.IMAGE ? dto.code.toUpperCase() : dto.code;
    const matches = { $eq: ['$code', { $literal: code }] };
    const before = await this.database(() =>
      this.captchaModel
        .findOneAndUpdate(
          {
            key: dto.key,
            kind: dto.kind,
            purpose: dto.purpose,
            subject: dto.subject,
            status: CaptchaStatus.PENDING,
            $expr: {
              $and: [{ $gt: ['$expireAt', '$$NOW'] }, { $lt: ['$failedAttempts', '$maxAttempts'] }],
            },
          },
          [
            {
              $set: {
                status: {
                  $cond: [
                    matches,
                    CaptchaStatus.USED,
                    {
                      $cond: [
                        { $gte: [{ $add: ['$failedAttempts', 1] }, '$maxAttempts'] },
                        CaptchaStatus.LOCKED,
                        CaptchaStatus.PENDING,
                      ],
                    },
                  ],
                },
                failedAttempts: {
                  $cond: [matches, '$failedAttempts', { $add: ['$failedAttempts', 1] }],
                },
                code: { $cond: [matches, '$$REMOVE', '$code'] },
              },
            },
          ],
          { new: false }
        )
        .select('+code')
        .maxTimeMS(DB_TIMEOUT_MS)
        .lean()
        .exec()
    );
    const stored = Buffer.from(before?.code ?? '');
    const expected = Buffer.from(code);
    const success =
      stored.length > 0 && stored.length === expected.length && timingSafeEqual(stored, expected);
    this.logger.log({ event: success ? 'captcha_verified' : 'captcha_invalid', kind: dto.kind });
    return success;
  }

  async count(query: ListCaptchasQuery): Promise<number> {
    const { filter } = buildMongooseQuery(query);
    return this.database(() =>
      this.captchaModel.countDocuments(filter).maxTimeMS(DB_TIMEOUT_MS).exec()
    );
  }

  async list(query: ListCaptchasQuery): Promise<Captcha[]> {
    const { limit = 10, sort, offset = 0, filter } = buildMongooseQuery(query);
    const docs = await this.database(() =>
      this.captchaModel
        .find(filter)
        .select(METADATA)
        .sort(sort)
        .skip(offset)
        .limit(limit)
        .maxTimeMS(DB_TIMEOUT_MS)
        .lean()
        .exec()
    );
    return docs.map((doc) => this.metadata(doc));
  }

  async get(id: string): Promise<Captcha | null> {
    if (!/^[a-fA-F0-9]{24}$/.test(id)) return null;
    const doc = await this.database(() =>
      this.captchaModel.findById(id).select(METADATA).maxTimeMS(DB_TIMEOUT_MS).lean().exec()
    );
    return doc ? this.metadata(doc) : null;
  }

  async delete(key: string): Promise<void> {
    await this.database(() => this.captchaModel.deleteOne({ key }).maxTimeMS(DB_TIMEOUT_MS).exec());
  }

  cleanupAllData(): Promise<DeleteResult> {
    return this.captchaModel.deleteMany({}).exec();
  }
}
