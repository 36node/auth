import { OmitType, PartialType } from '@nestjs/swagger';

import { CreateCaptchaDto } from './create-captcha.dto';

export class UpsertCaptchaDto extends PartialType(OmitType(CreateCaptchaDto, ['key'])) {}
