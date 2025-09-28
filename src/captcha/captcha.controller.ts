import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

import { ErrorCodes } from 'src/constants';

import { CaptchaService } from './captcha.service';
import { CreateCaptchaDto } from './dto/create-captcha.dto';
import { ListCaptchasQuery } from './dto/list-captchas.dto';
import { UpdateCaptchaDto } from './dto/update-captcha.dto';
import { VerifyCaptchaDto, VerifyCaptchaResultDto } from './dto/verify-captcha.dto';
import { Captcha, CaptchaDocument } from './entities/captcha.entity';

@ApiTags('captcha')
@Controller('captchas')
export class CaptchaController {
  private readonly imgCaptcha: Captcha;

  constructor(private readonly captchaService: CaptchaService) {
    this.imgCaptcha = new Captcha();
  }

  /**
   * Create captcha
   */
  @ApiOperation({ operationId: 'createCaptcha' })
  @ApiCreatedResponse({
    description: 'The captcha has been successfully created.',
    type: Captcha,
  })
  @Post()
  async create(@Body() createDto: CreateCaptchaDto): Promise<CaptchaDocument> {
    const captcha = await this.captchaService.create(createDto);
    return captcha;
  }

  /**
   * List captchas
   */
  @ApiOperation({ operationId: 'listCaptchas' })
  @ApiOkResponse({
    description: 'A paged array of captchas.',
    type: [Captcha],
  })
  @Get()
  async list(
    @Query('ListCaptchasQuery') query: ListCaptchasQuery,
    @Res() res: Response
  ): Promise<CaptchaDocument[]> {
    const count = await this.captchaService.count(query);
    const data = await this.captchaService.list(query);
    res.set({ 'X-Total-Count': count.toString() }).json(data);
    return data;
  }

  /**
   * Find captcha by id
   */
  @ApiOperation({ operationId: 'getCaptcha' })
  @ApiOkResponse({
    description: 'The captcha with expected id.',
    type: Captcha,
  })
  @Get(':captchaId')
  async get(@Param('captchaId') captchaId: string): Promise<CaptchaDocument> {
    const captcha = await this.captchaService.get(captchaId);
    if (!captcha)
      throw new NotFoundException({
        code: ErrorCodes.CAPTCHA_NOT_FOUND,
        message: `Captcha ${captchaId} not found.`,
      });
    return captcha;
  }

  /**
   * Update captcha
   */
  @ApiOperation({ operationId: 'updateCaptcha' })
  @ApiOkResponse({
    description: 'The captcha updated.',
    type: Captcha,
  })
  @Patch(':captchaId')
  async update(
    @Param('captchaId') captchaId: string,
    @Body() updateDto: UpdateCaptchaDto
  ): Promise<CaptchaDocument> {
    const captcha = await this.captchaService.update(captchaId, updateDto);
    if (!captcha)
      throw new NotFoundException({
        code: ErrorCodes.CAPTCHA_NOT_FOUND,
        message: `Captcha ${captchaId} not found.`,
      });
    return captcha;
  }

  /**
   * Delete captcha
   */
  @ApiOperation({ operationId: 'deleteCaptcha' })
  @ApiNoContentResponse({ description: 'No content.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':captchaId')
  async delete(@Param('captchaId') captchaId: string) {
    await this.captchaService.delete(captchaId);
  }

  /**
   * verify captcha
   */
  @ApiOperation({ operationId: 'verifyCaptcha' })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Check if the captcha is valid.',
    type: VerifyCaptchaResultDto,
  })
  @Post('@verifyCaptcha')
  async verifyCaptcha(@Body() dto: VerifyCaptchaDto): Promise<VerifyCaptchaResultDto> {
    const captcha = await this.captchaService.getByKey(dto.key, { code: dto.code });
    return { success: !!captcha };
  }
}
