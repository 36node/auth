import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Document } from 'mongoose';

import { helper, MongoEntity } from 'src/mongo';

import { CaptchaKind } from '../captcha-policy.service';

export enum CaptchaStatus {
  PENDING = 'pending',
  USED = 'used',
  LOCKED = 'locked',
}

// Storage is deliberately independent of the response/creation DTOs.
@Schema({ bufferCommands: false })
export class CaptchaDoc {
  @Prop({ required: true }) key: string;
  @Prop({ required: true, enum: CaptchaKind }) kind: CaptchaKind;
  @Prop({ required: true }) purpose: string;
  @Prop({ required: true }) subject: string;
  @Prop({ select: false }) code?: string;
  @Prop({ required: true }) expireAt: Date;
  @Prop({ required: true }) maxAttempts: number;
  @Prop({ required: true, default: 0 }) failedAttempts: number;
  @Prop({ required: true, enum: CaptchaStatus }) status: CaptchaStatus;
}

export const CaptchaSchema = helper(SchemaFactory.createForClass(CaptchaDoc));
CaptchaSchema.index({ key: 1 }, { unique: true });
CaptchaSchema.index({ kind: 1, purpose: 1, subject: 1 }, { unique: true });
CaptchaSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
export type CaptchaDocument = CaptchaDoc & Document & MongoEntity;

/** Only metadata may appear in read responses. */
export class Captcha extends OmitType(MongoEntity, ['createdBy', 'updatedBy'] as const) {
  key: string;
  @ApiProperty({ enum: CaptchaKind, enumName: 'CaptchaKind' }) kind: CaptchaKind;
  purpose: string;
  subject: string;
  expireAt: Date;
  maxAttempts: number;
  failedAttempts: number;
  @ApiProperty({ enum: CaptchaStatus, enumName: 'CaptchaStatus' }) status: CaptchaStatus;
}

export class IssuedCaptcha extends Captcha {
  /** Returned once to the trusted issuing backend. Never forward to the frontend. */
  code: string;
}
