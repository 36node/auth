import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtPayload } from 'src/auth';
import { CaptchaService } from 'src/captcha';
import { addShortTimeSpan } from 'src/lib/lang/time';
import { CreateSessionDto, ErrorCodes as SessionErrorCodes, SessionService } from 'src/session';
import { ThirdPartySource } from 'src/third-party';
import { User, UserDocument, ErrorCodes as UserErrorCodes, UserService } from 'src/user';

import { AuthService } from './auth.service';
import { ErrorCodes } from './constants';
import { GithubDto } from './dto/github.dto';
import { LoginByEmailDto, LoginByPhoneDto, LoginDto, LogoutDto } from './dto/login.dto';
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
    private readonly jwtService: JwtService,
    private readonly captchaService: CaptchaService,
    private readonly authService: AuthService
  ) {}

  _login = async (user: UserDocument): Promise<SessionWithToken> => {
    const session = await this.sessionService.create({
      subject: `user|${user.id}`,
      ns: user.ns,
      groups: user.groups,
      type: user.type,
      refreshTokenExpireAt: addShortTimeSpan(SESSION_EXPIRES_IN), // session 先固定 7 天过期吧
    });

    const jwtpayload: JwtPayload = {
      sid: session.id,
      ns: user.ns,
      groups: user.groups,
      type: user.type,
    };

    const tokenExpireAt = addShortTimeSpan(TOKEN_EXPIRES_IN);
    const token = this.jwtService.sign(jwtpayload, {
      expiresIn: TOKEN_EXPIRES_IN,
      subject: `user|${user.id}`,
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
  @HttpCode(HttpStatus.OK)
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
   * login by Github
   */
  @ApiOperation({ operationId: 'loginByGithub' })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'The session with token has been successfully created.',
    type: SessionWithToken,
  })
  @Post('@loginByGithub')
  async loginByGithub(@Body() githubDto: GithubDto): Promise<SessionWithToken> {
    const { code } = githubDto;
    const githubAccessToken = await this.authService.getGithubAccessToken(code);
    if (!githubAccessToken) {
      throw new UnauthorizedException({
        code: ErrorCodes.AUTH_FAILED,
        message: `github access token not found.`,
      });
    }
    const githubUser = await this.authService.getGithubUser(githubAccessToken);
    if (!githubUser) {
      throw new UnauthorizedException({
        code: ErrorCodes.AUTH_FAILED,
        message: `github user not found.`,
      });
    }

    // github 已绑定用户
    if (githubUser.uid) {
      const user = await this.userService.get(githubUser.uid);
      if (!user) {
        throw new UnauthorizedException({
          code: ErrorCodes.AUTH_FAILED,
          message: `user not found.`,
        });
      }

      return this._login(user);
    }

    // github 未绑定用户
    const session = await this.sessionService.create({
      subject: `${ThirdPartySource.GITHUB}|${githubUser.login}`,
      refreshTokenExpireAt: addShortTimeSpan(SESSION_EXPIRES_IN), // session 先固定 7 天过期吧
    });

    const jwtpayload: JwtPayload = {};

    const tokenExpireAt = addShortTimeSpan(TOKEN_EXPIRES_IN);
    const token = this.jwtService.sign(jwtpayload, {
      expiresIn: TOKEN_EXPIRES_IN,
      subject: `${ThirdPartySource.GITHUB}|${githubUser.login}`,
    });

    const res: SessionWithToken = {
      ...session.toJSON(),
      token,
      tokenExpireAt,
    };

    return res;
  }

  /**
   * login by email and code
   */
  @ApiOperation({ operationId: 'loginByEmail' })
  @HttpCode(HttpStatus.OK)
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
  @HttpCode(HttpStatus.OK)
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
   * logout
   */
  @ApiOperation({ operationId: 'logout' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('@logout')
  async logout(@Body() dto: LogoutDto): Promise<void> {
    await this.sessionService.deleteByRefreshToken(dto.refreshToken);
  }

  /**
   * register with username and password
   */
  @ApiOperation({ operationId: 'register' })
  @HttpCode(HttpStatus.OK)
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
  @HttpCode(HttpStatus.OK)
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
  @HttpCode(HttpStatus.OK)
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
   * 为用户签发一个一次性的 token 无法 refresh
   */
  @ApiOperation({ operationId: 'signToken' })
  @HttpCode(HttpStatus.OK)
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
      ns: user.ns,
      type: user.type,
      groups: user.groups,
      permissions: dto.permissions,
    };

    const token = this.jwtService.sign(jwtpayload, {
      expiresIn: dto.expiresIn,
      subject: `user|${user.id}`,
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
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'The session with token has been successfully refreshed.',
    type: SessionWithToken,
  })
  @Post('@refresh')
  async refreshToken(@Body() dto: RefreshTokenDto): Promise<Token> {
    let session = await this.sessionService.findByRefreshToken(dto.refreshToken);
    if (!session) {
      throw new UnauthorizedException({
        code: SessionErrorCodes.SESSION_NOT_FOUND,
        message: `session with refresh token ${dto.refreshToken} not found.`,
      });
    }

    if (session.refreshTokenExpireAt.getTime() < Date.now()) {
      throw new UnauthorizedException({
        code: SessionErrorCodes.SESSION_EXPIRED,
        message: 'Session has been expired.',
      });
    }

    const payload = {
      ns: session.ns,
      groups: session.groups,
      type: session.type,
      permissions: session.permissions,
    };

    if (session.shouldRotate()) {
      session = await this.sessionService.create({
        ...payload,
        subject: session.subject,
        refreshTokenExpireAt: addShortTimeSpan(SESSION_EXPIRES_IN),
      } as CreateSessionDto);
    }

    const jwtpayload: JwtPayload = {
      ...payload,
      sid: session.id,
    };

    const tokenExpireAt = addShortTimeSpan(TOKEN_EXPIRES_IN);
    const token = this.jwtService.sign(jwtpayload, {
      expiresIn: TOKEN_EXPIRES_IN,
      subject: session.subject,
    });

    return {
      ...session.toJSON(),
      token,
      tokenExpireAt,
    };
  }
}
