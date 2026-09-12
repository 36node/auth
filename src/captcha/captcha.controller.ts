import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';

import { CountResult } from 'src/common';
import { exceptionFactory } from 'src/common/exception-factory';
import { ErrorCodes } from 'src/constants';

import { CaptchaService } from './captcha.service';
import { CreateCaptchaDto } from './dto/create-captcha.dto';
import { ListCaptchasQuery } from './dto/list-captchas.dto';
import { VerifyCaptchaDto, VerifyCaptchaResultDto } from './dto/verify-captcha.dto';
import { Captcha, IssuedCaptcha } from './entities/captcha.entity';

@ApiTags('captcha')
@ApiSecurity('ApiKey')
@ApiResponse({
  status: 429,
  description: 'CAPTCHA_RATE_LIMITED',
  headers: {
    'Retry-After': { description: 'Seconds until retry is allowed.', schema: { type: 'integer' } },
  },
})
@ApiResponse({ status: 503, description: 'CAPTCHA_UNAVAILABLE' })
@Controller('captchas')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true, exceptionFactory }))
export class CaptchaController {
  constructor(private readonly captchaService: CaptchaService) {}

  /** Issue a captcha; plaintext is returned only to the trusted backend. */
  @ApiOperation({ operationId: 'createCaptcha' })
  @ApiCreatedResponse({ type: IssuedCaptcha })
  @Post()
  create(@Body() dto: CreateCaptchaDto): Promise<IssuedCaptcha> {
    return this.captchaService.create(dto);
  }

  @ApiOperation({ operationId: 'listCaptchas' })
  @ApiOkResponse({ type: [Captcha] })
  @Get()
  list(@Query() query: ListCaptchasQuery): Promise<Captcha[]> {
    return this.captchaService.list(query);
  }

  @ApiOperation({ operationId: 'countCaptchas' })
  @ApiOkResponse({ type: CountResult })
  @Post('@count')
  async count(@Query() query: ListCaptchasQuery): Promise<CountResult> {
    return { count: await this.captchaService.count(query) };
  }

  @ApiOperation({ operationId: 'getCaptcha' })
  @ApiOkResponse({ type: Captcha })
  @ApiParam({ name: 'identifier', description: 'Captcha document id, as returned by creation.' })
  @Get(':identifier')
  async get(@Param('identifier') id: string): Promise<Captcha> {
    const captcha = await this.captchaService.get(id);
    if (!captcha)
      throw new NotFoundException({
        code: ErrorCodes.CAPTCHA_NOT_FOUND,
        message: 'Captcha not found.',
      });
    return captcha;
  }

  /** Revoke this issuance by key; a stale key cannot revoke a replacement. */
  @ApiOperation({ operationId: 'deleteCaptcha' })
  @ApiNoContentResponse({ description: 'No content.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'identifier', description: 'Issuance key to revoke; NOT the document id.' })
  @Delete(':identifier')
  delete(@Param('identifier') key: string): Promise<void> {
    return this.captchaService.delete(key);
  }

  /** Verify AND consume; successful verification is never reusable. */
  @ApiOperation({ operationId: 'verifyCaptcha' })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: VerifyCaptchaResultDto })
  @Post('@verifyCaptcha')
  async verifyCaptcha(@Body() dto: VerifyCaptchaDto): Promise<VerifyCaptchaResultDto> {
    return { success: await this.captchaService.consume(dto) };
  }
}
