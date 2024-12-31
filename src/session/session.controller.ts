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

import { ErrorCodes } from 'src/constants';

import { CreateSessionDto } from './dto/create-session.dto';
import { ListSessionsQuery } from './dto/list-sessions.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { Session } from './entities/session.entity';
import { SessionService } from './session.service';

@ApiTags('session')
@Controller('sessions')
export class SessionController {
  constructor(private sessionService: SessionService, private jwtService: JwtService) {}

  /**
   * Create session
   */
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
  @ApiOperation({ operationId: 'listSessions' })
  @ApiOkResponse({
    description: 'A paged array of sessions.',
    type: [Session],
  })
  @Get()
  async list(@Query() query: ListSessionsQuery, @Res() res: Response): Promise<Session[]> {
    const count = await this.sessionService.count(query);
    const data = await this.sessionService.list(query);
    res.set({ 'X-Total-Count': count.toString() }).json(data);
    return data;
  }

  /**
   * Find session by id
   */
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
        code: ErrorCodes.SESSION_NOT_FOUND,
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
        code: ErrorCodes.SESSION_NOT_FOUND,
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
}
