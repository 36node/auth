import { PartialType } from '@nestjs/swagger';

import { CaptchaDoc } from '../entities/captcha.entity';

export class UpdateCaptchaDto extends PartialType(CaptchaDoc) {}
