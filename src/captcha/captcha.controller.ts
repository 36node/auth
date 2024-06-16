import SMSClient from '@alicloud/sms-sdk';
import { BadRequestException, Body, Controller, NotFoundException, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Captcha } from 'captcha.gif';
import { trimStart } from 'lodash';

import { errCodes, Public } from 'src/common';
import { settings } from 'src/config';
import { EmailService } from 'src/email';
import { NamespaceService } from 'src/namespace';

import { CaptchaService } from './captcha.service';
import {
  CreateCaptchaByEmailDto,
  CreateCaptchaByPhotoDto,
  CreateCaptchaBySmsDto,
} from './dto/create-captcha.dto';
import {
  CaptchaByEmailResult,
  CaptchaByPhotoResult,
  CaptchaBySmsResult,
} from './entities/captcha-result.entity';

@ApiTags('captcha')
@Public()
@Controller('captchas')
export class CaptchaController {
  private readonly smsClient: SMSClient;
  private readonly imgCaptcha: Captcha;

  constructor(
    private readonly captchaService: CaptchaService,
    private readonly namespaceService: NamespaceService,
    private readonly emailService: EmailService
  ) {
    const captchaCfg = settings.captcha;

    this.smsClient = new SMSClient({
      accessKeyId: captchaCfg.sms.keyId,
      secretAccessKey: captchaCfg.sms.keySecret,
    });

    this.imgCaptcha = new Captcha();
  }

  /**
   * Create captcha by sms
   */
  @ApiOperation({ operationId: 'createCaptchaBySms' })
  @ApiCreatedResponse({
    description: 'The captcha by sms has been successfully created.',
    type: CaptchaBySmsResult,
  })
  @Post('/@createCaptchaBySms')
  async createBySms(@Body() createDto: CreateCaptchaBySmsDto) {
    const captchaCfg = settings.captcha;

    // fake 模式下使用固定code
    const code = captchaCfg.fake
      ? captchaCfg.fake_code
      : this.captchaService.generateCaptcha(captchaCfg.length);

    const { phone, dialingPrefix, scope, ...rest } = createDto;

    const namespace = await this.namespaceService.getByFullPath(scope);
    if (!namespace) {
      throw new NotFoundException({
        code: errCodes.NAMESPACE_NOT_FOUND,
        message: `Namespace ${scope} not found.`,
        details: [
          {
            message: `Namespace ${scope} not found.`,
            field: 'scope',
          },
        ],
      });
    }

    // 区号+手机号 作为key
    const full_phone = dialingPrefix + phone;

    const captcha = await this.captchaService.upsertByKey(full_phone, scope, {
      ...rest,
      code,
      dialingPrefix,
    });

    if (!captchaCfg.fake) {
      const smsCfg = captchaCfg.sms;

      const options = {
        // 去掉前缀的+号
        PhoneNumbers: trimStart(full_phone, '+'),
        SignName: smsCfg.sign,
        TemplateCode: dialingPrefix === '+86' ? smsCfg.template : smsCfg.templateInternation,
        TemplateParam: JSON.stringify({ code }),
      };

      try {
        const ret = await this.smsClient.sendSMS(options);
        if (ret.Code !== 'OK') {
          throw new BadRequestException({
            code: errCodes.SMS_SEND_FAILED,
            message: JSON.stringify(ret),
            details: [
              {
                message: JSON.stringify(ret),
                field: 'captcha-sms',
              },
            ],
          });
        }
      } catch (e) {
        throw new BadRequestException({
          code: errCodes.SMS_SEND_ERROR,
          message: JSON.stringify(e),
          details: [
            {
              message: JSON.stringify(e),
              field: 'captcha-sms',
            },
          ],
        });
      }
    }
    return { ...createDto, expireAt: captcha.expireAt };
  }

  /**
   * Create captcha by email
   */
  @ApiOperation({ operationId: 'createCaptchaByEmail' })
  @ApiCreatedResponse({
    description: 'The captcha by email has been successfully created.',
    type: CaptchaByEmailResult,
  })
  @Post('/@createCaptchaByEmail')
  async createByEmail(@Body() createDto: CreateCaptchaByEmailDto) {
    const captchaCfg = settings.captcha;

    // fake 模式下使用固定code
    const code = captchaCfg.fake
      ? captchaCfg.fake_code
      : this.captchaService.generateCaptcha(captchaCfg.length);

    const { email, scope, ...rest } = createDto;

    const namespace = await this.namespaceService.getByFullPath(scope);
    if (!namespace) {
      throw new NotFoundException({
        code: errCodes.NAMESPACE_NOT_FOUND,
        message: `Namespace ${scope} not found.`,
        details: [
          {
            message: `Namespace ${scope} not found.`,
            field: 'scope',
          },
        ],
      });
    }

    const captcha = await this.captchaService.upsertByKey(email, scope, {
      ...rest,
      code,
    });

    if (!captchaCfg.fake) {
      await this.emailService.sendCaptchaEmail({ to: email, code });
      return { ...createDto, expireAt: captcha.expireAt };
    }
  }

  /**
   * Create captcha by photo
   */
  @ApiOperation({ operationId: 'createCaptchaByPhoto' })
  @ApiCreatedResponse({
    description: 'The captcha by photo has been successfully created.',
    type: CaptchaByPhotoResult,
  })
  @Post('/@createCaptchaByPhoto')
  async createByPhoto(@Body() createDto: CreateCaptchaByPhotoDto) {
    const { token, buffer } = this.imgCaptcha.generate(4);

    const { key, purpose, scope } = createDto;

    const namespace = await this.namespaceService.getByFullPath(scope);
    if (!namespace) {
      throw new NotFoundException({
        code: errCodes.NAMESPACE_NOT_FOUND,
        message: `Namespace ${scope} not found.`,
        details: [
          {
            message: `Namespace ${scope} not found.`,
            field: 'scope',
          },
        ],
      });
    }

    const captcha = await this.captchaService.upsertByKey(key, scope, {
      code: token.toLocaleLowerCase(),
      purpose,
    });
    return {
      ...createDto,
      capchaGifHex: `data:image/gif;base64,${buffer.toString('base64')}`,
      expireAt: captcha.expireAt,
    };
  }
}
