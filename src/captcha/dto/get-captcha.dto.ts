import { PickType } from '@nestjs/swagger';

import { UpdateCaptchaDto } from './update-captcha.dto';

export class getCaptchaByKeyDto extends PickType(UpdateCaptchaDto, ['code']) {}
