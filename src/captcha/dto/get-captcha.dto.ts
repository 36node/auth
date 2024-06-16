import { PartialType, PickType } from '@nestjs/swagger';

import { CaptchaDoc } from '../entities/captcha.entity';

export class getCaptchaByKeyDto extends PartialType(PickType(CaptchaDoc, ['code', 'purpose'])) {}
