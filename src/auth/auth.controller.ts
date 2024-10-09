import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtPayload } from 'src/auth';
import { CaptchaService } from 'src/captcha';
import { EmailRecordService } from 'src/email/email-record.service';
import { GroupService } from 'src/group';
import { addShortTimeSpan } from 'src/lib/lang/time';
import { NamespaceService } from 'src/namespace';
import { ErrorCodes as SessionErrorCodes, SessionService } from 'src/session';
import { SmsRecordService } from 'src/sms';
import { User, UserDocument, ErrorCodes as UserErrorCodes, UserService } from 'src/user';

import { AuthService } from './auth.service';
import { ErrorCodes } from './constants';
import { LoginByEmailDto, LoginByPhoneDto, LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterByEmailDto, RegisterbyPhoneDto, RegisterDto } from './dto/register.dto';
import { SignTokenDto } from './dto/sign-token.dto';
import { SessionWithToken, Token } from './entities/session-with-token.entity';

const SESSION_EXPIRES_IN = '7d';
const TOKEN_EXPIRES_IN = '1d';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly userService: UserService,
    private readonly namespaceService: NamespaceService,
    private readonly groupService: GroupService,
    private readonly jwtService: JwtService,
    private readonly captchaService: CaptchaService,
    private readonly emailRecordService: EmailRecordService,
    private readonly smsRecordService: SmsRecordService,
    private readonly authService: AuthService
  ) {}

  _login = async (user: UserDocument): Promise<SessionWithToken> => {
    const session = await this.sessionService.create({
      uid: user.id,
      expireAt: addShortTimeSpan(SESSION_EXPIRES_IN), // session 先固定 7 天过期吧
    });

    const jwtpayload: JwtPayload = {
      roles: user.roles,
      ns: user.ns,
      super: user.super,
    };

    const tokenExpireAt = addShortTimeSpan(TOKEN_EXPIRES_IN);
    const token = this.jwtService.sign(jwtpayload, {
      expiresIn: TOKEN_EXPIRES_IN,
      subject: user.id,
    });

    const res: SessionWithToken = {
      ...session.toJSON(),
      token,
      tokenExpireAt,
    };

    this.userService.update(user.id, {
      lastLoginAt: new Date(),
    });

    return res;
  };

  /**
   * login with username/phone/email and password
   */
  @ApiOperation({ operationId: 'login' })
  @ApiOkResponse({
    description: 'The session with token has been successfully created.',
    type: SessionWithToken,
  })
  @Post('@login')
  async login(@Body() loginDto: LoginDto): Promise<SessionWithToken> {
    const locked = await this.authService.isLocked(loginDto.login);
    if (locked) {
      throw new ForbiddenException({
        code: ErrorCodes.TOO_MANY_LOGIN_ATTEMPTS,
        message: `too many login attempts.`,
      });
    }

    const user = await this.userService.findByLogin(loginDto.login);
    if (
      !user ||
      !user.password ||
      !this.userService.checkPassword(user.password, loginDto.password)
    ) {
      await this.authService.lock(loginDto.login);

      throw new UnauthorizedException({
        code: ErrorCodes.AUTH_FAILED,
        message: `username or password invalid.`,
      });
    }

    return this._login(user);
  }

  /**
   * login with email and code
   */
  @ApiOperation({ operationId: 'loginByEmail' })
  @ApiOkResponse({
    description: 'The session with token has been successfully created.',
    type: SessionWithToken,
  })
  @Post('@loginByEmail')
  async loginByEmail(@Body() dto: LoginByEmailDto): Promise<SessionWithToken> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user || !(await this.captchaService.consume(dto.key, dto.code))) {
      throw new UnauthorizedException({
        code: ErrorCodes.AUTH_FAILED,
        message: `email or captcha code wrong`,
      });
    }

    return this._login(user);
  }

  /**
   * login with phone and code
   */
  @ApiOperation({ operationId: 'loginByPhone' })
  @ApiOkResponse({
    description: 'The session with token has been successfully created.',
    type: SessionWithToken,
  })
  @Post('@loginByPhone')
  async loginByPhone(@Body() dto: LoginByPhoneDto): Promise<SessionWithToken> {
    const user = await this.userService.findByPhone(dto.phone);
    if (!user || !(await this.captchaService.consume(dto.key, dto.code))) {
      throw new UnauthorizedException({
        code: ErrorCodes.AUTH_FAILED,
        message: `phone or captcha code wrong`,
      });
    }

    return this._login(user);
  }

  /**
   * register with username and password
   */
  @ApiOperation({ operationId: 'register' })
  @ApiOkResponse({
    description: 'The user just created.',
    type: User,
  })
  @Post('@register')
  async register(@Body() dto: RegisterDto): Promise<UserDocument> {
    const user = await this.userService.findByUsername(dto.username);
    if (user) {
      throw new ConflictException({
        code: ErrorCodes.USER_ALREADY_EXISTS,
        message: `username ${dto.username} already exists.`,
        details: [
          {
            message: `username ${dto.username} already exists.`,
            field: 'username',
          },
        ],
      });
    }

    return this.userService.create({
      username: dto.username,
      password: dto.password,
      ns: dto.ns,
    });
  }

  /**
   * register with phone and code
   */
  @ApiOperation({ operationId: 'registerByPhone' })
  @ApiOkResponse({
    description: 'The user just created.',
    type: User,
  })
  @Post('@registerByPhone')
  async registerByPhone(@Body() dto: RegisterbyPhoneDto): Promise<UserDocument> {
    const user = await this.userService.findByPhone(dto.phone);
    if (user) {
      throw new ConflictException({
        code: ErrorCodes.USER_ALREADY_EXISTS,
        message: `phone ${dto.phone} already exists.`,
      });
    }

    if (!(await this.captchaService.consume(dto.key, dto.code))) {
      throw new BadRequestException({
        code: ErrorCodes.CAPTCHA_INVALID,
        message: 'captcha invalid.',
      });
    }

    return this.userService.create({
      phone: dto.phone,
      ns: dto.ns,
    });
  }

  /**
   * register with email and code
   */
  @ApiOperation({ operationId: 'registerByEmail' })
  @ApiOkResponse({
    description: 'The user just created.',
    type: User,
  })
  @Post('@registerByEmail')
  async registerByEmail(@Body() dto: RegisterByEmailDto): Promise<UserDocument> {
    const user = await this.userService.findByEmail(dto.email);
    if (user) {
      throw new ConflictException({
        code: ErrorCodes.USER_ALREADY_EXISTS,
        message: `email ${dto.email} already exists.`,
      });
    }

    if (!(await this.captchaService.consume(dto.key, dto.code))) {
      throw new BadRequestException({
        code: ErrorCodes.CAPTCHA_INVALID,
        message: 'captcha invalid.',
      });
    }

    return this.userService.create({
      email: dto.email,
      ns: dto.ns,
    });
  }

  /**
   * sign token
   */
  @ApiOperation({ operationId: 'signToken' })
  @ApiOkResponse({
    description: 'The token has been successfully signed.',
    type: Token,
  })
  @Post('@signToken')
  async signToken(@Body() dto: SignTokenDto): Promise<Token> {
    const user = await this.userService.get(dto.uid);
    if (!user) {
      throw new NotFoundException({
        code: UserErrorCodes.USER_NOT_FOUND,
        message: `user ${dto.uid} not found.`,
      });
    }

    const jwtpayload: JwtPayload = {
      acl: dto.acl,
      roles: user.roles,
      ns: user.ns,
      super: user.super,
    };

    const token = this.jwtService.sign(jwtpayload, {
      expiresIn: dto.expiresIn,
      subject: user.id,
    });
    const tokenExpireAt = addShortTimeSpan(dto.expiresIn);

    return {
      token,
      tokenExpireAt,
    };
  }

  /**
   * refresh
   */
  @ApiOperation({ operationId: 'refresh' })
  @ApiOkResponse({
    description: 'The session with token has been successfully refreshed.',
    type: SessionWithToken,
  })
  @Post('@refresh')
  async refreshToken(@Body() dto: RefreshTokenDto): Promise<Token> {
    let session = await this.sessionService.findByKey(dto.key);
    if (!session) {
      throw new UnauthorizedException({
        code: SessionErrorCodes.SESSION_NOT_FOUND,
        message: `session with key ${dto.key} not found.`,
      });
    }

    if (session.expireAt.getTime() < Date.now()) {
      throw new UnauthorizedException({
        code: SessionErrorCodes.SESSION_EXPIRED,
        message: 'Session has been expired.',
      });
    }

    if (session.shouldRotate()) {
      session = await this.sessionService.create({
        uid: session.user.id,
        expireAt: addShortTimeSpan(SESSION_EXPIRES_IN),
        acl: session.acl,
      });
    }

    const jwtpayload: JwtPayload = {
      acl: session.acl,
      roles: session.user.roles,
      ns: session.user.ns,
      super: session.user.super,
    };

    const tokenExpireAt = addShortTimeSpan(TOKEN_EXPIRES_IN);
    const token = this.jwtService.sign(jwtpayload, {
      expiresIn: TOKEN_EXPIRES_IN,
      subject: session.user.id,
    });

    return {
      ...session.toJSON(),
      token,
      tokenExpireAt,
    };
  }

  /**
   * clearnup all data
   */
  @ApiOperation({ operationId: 'cleanupAllData' })
  @ApiNoContentResponse({ description: 'No content.' })
  @Delete('@cleanup')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cleanupAllData(): Promise<void> {
    await this.emailRecordService.cleanupAllData();
    await this.smsRecordService.cleanupAllData();
    await this.captchaService.cleanupAllData();
    await this.sessionService.cleanupAllData();
    await this.userService.cleanupAllData();
    await this.groupService.cleanupAllData();
    await this.namespaceService.cleanupAllData();
  }
}
