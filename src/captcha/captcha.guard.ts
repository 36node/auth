import {
  applyDecorators,
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { get } from 'lodash';

import { errCodes } from 'src/common';

import { CaptchaService } from './captcha.service';
import { CaptchaPurpose } from './entities/captcha.entity';

export const CAPTCHA_GUARD_KEY = 'CaptchaGuardKey';

@Injectable()
export class CaptchaGuard implements CanActivate {
  constructor(
    private readonly captchaService: CaptchaService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const purpose = this.reflector.get<CaptchaPurpose>(CAPTCHA_GUARD_KEY, context.getHandler());

    const request = context.switchToHttp().getRequest();
    const code = get(request, 'body.code');
    const scope = get(request, 'body.scope');

    let key: string;

    // 如果是用手机号，则需要补齐区号
    if (get(request, 'body.phone')) {
      const dialingPrefix = get(request, 'body.dialingPrefix');

      if (!dialingPrefix) {
        throw new BadRequestException({
          code: errCodes.CAPTCHA_NEED_DIALING_PREFIX,
          message: 'Need dialing prefix.',
        });
      }

      key = `${dialingPrefix}${get(request, 'body.phone')}`;
    } else {
      key = get(request, 'body.email') || get(request, 'body.key');
    }

    if (!code || !key) {
      throw new BadRequestException({
        code: errCodes.CAPTCHA_NOT_FOUND,
        message: `Need Captcha.`,
      });
    } else {
      // if (settings.captcha.fake && code === settings.captcha.fake_code) {
      //   return true;
      // }

      const captcha = await this.captchaService.getByKey(key, scope, {
        code,
        purpose,
      });
      if (!captcha) {
        throw new BadRequestException({
          code: errCodes.CAPTCHA_CODE_WRONG,
          message: `Captcha ${code} wrong.`,
        });
      } else {
        await this.captchaService.delete(captcha.id);
      }
    }
    return true;
  }
}

export function WithCaptchaGuard(purpose: CaptchaPurpose, ...otherGuards: any[]): MethodDecorator {
  return applyDecorators(
    SetMetadata(CAPTCHA_GUARD_KEY, purpose),
    UseGuards(CaptchaGuard),
    UseGuards(...otherGuards)
  );
}
