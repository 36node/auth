import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
import { JwtService } from '@nestjs/jwt';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

import { JwtPayload } from 'src/auth';
import { errCodes } from 'src/common';
import { addShortTimeSpan } from 'src/lib/lang/time';

import { CreateSessionDto } from './dto/create-session.dto';
import { ListSessionQuery } from './dto/list-session.dto';
import { RestrictTokenDto } from './dto/restrict-token.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { OnlyToken, Session } from './entities/session.entity';
import { SessionService } from './session.service';

@ApiTags('session')
@Controller('sessions')
export class SessionController {
  constructor(private sessionService: SessionService, private jwtService: JwtService) {}

  /**
   * Create session
   */
  @ApiBearerAuth()
  @ApiOperation({ operationId: 'createSession' })
  @ApiCreatedResponse({
    description: 'The session has been successfully created.',
    type: Session,
  })
  @Post()
  create(@Body() createDto: CreateSessionDto): Promise<Session> {
    return this.sessionService.create(createDto);
  }

  /**
   * List sessions
   */
  @ApiBearerAuth()
  @ApiOperation({ operationId: 'listSessions' })
  @ApiOkResponse({
    description: 'A paged array of sessions.',
    type: [Session],
  })
  @Get()
  async list(@Query() query: ListSessionQuery, @Res() res: Response): Promise<Session[]> {
    const count = await this.sessionService.count(query);
    const data = await this.sessionService.list(query);
    res.set({ 'X-Total-Count': count.toString() }).json(data);
    return data;
  }

  /**
   * Find session by id
   */
  @ApiBearerAuth()
  @ApiOperation({ operationId: 'getSession' })
  @ApiOkResponse({
    description: 'The session with expected id.',
    type: Session,
  })
  @Get(':sessionId')
  async get(@Param('sessionId') sessionId: string): Promise<Session> {
    const session = await this.sessionService.get(sessionId);
    if (!session)
      throw new NotFoundException({
        code: errCodes.SESSION_NOT_FOUND,
        message: `Session ${sessionId} not found.`,
        details: [
          {
            message: `Session ${sessionId} not found.`,
            field: 'sessionId',
          },
        ],
      });
    return session;
  }

  /**
   * Update session
   */
  @ApiBearerAuth()
  @ApiOperation({ operationId: 'updateSession' })
  @ApiOkResponse({
    description: 'The session updated.',
    type: Session,
  })
  @Patch(':sessionId')
  async update(
    @Param('sessionId') sessionId: string,
    @Body() updateDto: UpdateSessionDto
  ): Promise<Session> {
    const session = await this.sessionService.update(sessionId, updateDto);
    if (!session)
      throw new NotFoundException({
        code: errCodes.SESSION_NOT_FOUND,
        message: `Session ${sessionId} not found.`,
        details: [
          {
            message: `Session ${sessionId} not found.`,
            field: 'sessionId',
          },
        ],
      });
    return session;
  }

  /**
   * Delete session
   */
  @ApiBearerAuth()
  @ApiOperation({ operationId: 'deleteSession' })
  @ApiNoContentResponse({ description: 'No content.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':sessionId')
  async delete(@Param('sessionId') sessionId: string) {
    await this.sessionService.delete(sessionId);
  }

  /**
   * 返回一个 token
   *
   * 一般用于给设备等提供临时访问凭证
   *
   * @param restrictTokenDto
   * @returns session
   */
  @ApiBearerAuth()
  @ApiOperation({ operationId: 'restrictToken' })
  @ApiCreatedResponse({
    description: 'The restricted token.',
    type: OnlyToken,
  })
  @Post('@restrictToken')
  @HttpCode(200)
  async restrict(@Body() restrictDto: RestrictTokenDto): Promise<OnlyToken> {
    const session = await this.sessionService.findByKey(restrictDto.key);
    if (!session) {
      throw new NotFoundException({
        code: errCodes.SESSION_NOT_FOUND,
        message: `key ${restrictDto.key} not found.`,
        details: [
          {
            message: `key ${restrictDto.key} not found.`,
            field: 'key',
          },
        ],
      });
    }
    if (session.expireAt.getTime() < Date.now()) {
      throw new ForbiddenException({
        code: errCodes.SESSION_EXPIRED,
        message: 'Session has expired.',
      });
    }

    /**
     * TODO:
     * 1. 限制 token 的权限 2. 限制 token 的有效期
     */

    const jwtpayload: JwtPayload = {
      roles: session.user.roles,
      ns: session.user.ns,
      acl: restrictDto.acl,
    };
    const token = this.jwtService.sign(jwtpayload, {
      expiresIn: restrictDto.expiresIn,
      subject: session.user.id,
    });
    const tokenExpireAt = addShortTimeSpan(restrictDto.expiresIn);

    return {
      token,
      tokenExpireAt,
    };
  }
}
