import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { get } from 'lodash';

import { JwtPayload } from 'src/auth';
import { CaptchaService } from 'src/captcha';
import * as config from 'src/config';
import { ErrorCodes } from 'src/constants';
import { assertHttp } from 'src/lib/lang/assert';
import { addShortTimeSpan } from 'src/lib/lang/time';
import { OAuthService } from 'src/oauth';
import { CreateSessionDto, SessionService } from 'src/session';
import { ThirdPartyDoc, ThirdPartyService } from 'src/third-party';
import { User, UserDocument, UserService } from 'src/user';

import { AuthService } from './auth.service';
import { GetAuthorizerQuery } from './dto/authorize-query.dto';
import { GithubDto } from './dto/github.dto';
import { LoginByEmailDto, LoginByPhoneDto, LoginDto, LogoutDto } from './dto/login.dto';
import { OAuthDto } from './dto/oauth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterByEmailDto, RegisterbyPhoneDto, RegisterDto } from './dto/register.dto';
import { ResetPasswordByEmailDto, ResetPasswordByPhoneDto } from './dto/reset-password.dto';
import { SignTokenDto } from './dto/sign-token.dto';
import { Authorizer } from './entities/authorizer.entity';
import { SessionWithToken, Token } from './entities/session-with-token.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly captchaService: CaptchaService,
    private readonly authService: AuthService,
    private readonly oauthService: OAuthService,
    private readonly thirdPartyService: ThirdPartyService
  ) {}

  _login = async (user: UserDocument): Promise<SessionWithToken> => {
    const session = await this.sessionService.create({
      subject: user.id,
      ns: user.ns,
      groups: user.groups,
      type: user.type,
      refreshTokenExpireAt: addShortTimeSpan(config.auth.refreshTokenExpiresIn), // session 先固定 7 天过期吧
    });

    const jwtpayload: JwtPayload = {
      sid: session.id,
      ns: user.ns,
      groups: user.groups,
      type: user.type,
    };

    const tokenExpireAt = addShortTimeSpan(config.auth.tokenExpiresIn);
    const token = this.jwtService.sign(jwtpayload, {
      expiresIn: config.auth.tokenExpiresIn,
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

  _loginByThirdParty = async (thirdParty: ThirdPartyDoc): Promise<SessionWithToken> => {
    const subject = thirdParty.tid;
    const session = await this.sessionService.create({
      subject,
      source: thirdParty.source,
      refreshTokenExpireAt: addShortTimeSpan(config.auth.refreshTokenExpiresIn), // session 先固定 7 天过期吧
    });

    const jwtpayload: JwtPayload = {
      sid: session.id,
      source: thirdParty.source,
    };

    const tokenExpireAt = addShortTimeSpan(config.auth.tokenExpiresIn);
    const token = this.jwtService.sign(jwtpayload, {
      expiresIn: config.auth.tokenExpiresIn,
      subject,
    });

    const res: SessionWithToken = {
      ...session.toJSON(),
      token,
      tokenExpireAt,
    };

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

  @ApiOperation({ operationId: 'getAuthorizer' })
  @Get('authorizer')
  getAuthorizer(@Query() query: GetAuthorizerQuery): Authorizer {
    const {
      provider,
      redirectUri: redirect_uri,
      responseType: response_type = 'code',
      state,
    } = query;
    const clientId = config.oauthProvider.clientId(provider);
    const authorizeUrl = config.oauthProvider.authorizeUrl(provider);

    const params = new URLSearchParams({
      client_id: clientId,
      response_type,
      ...(redirect_uri && { redirect_uri }),
      ...(state && { state }),
    });

    return {
      url: `${authorizeUrl}?${params.toString()}`,
    };
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
    return this.loginByOAuth({
      provider: 'github',
      code: githubDto.code,
      redirectUri: githubDto.redirectUri,
    });
  }

  /**
   * login by OAuth
   */
  @ApiOperation({ operationId: 'loginByOAuth' })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'The session with token has been successfully created.',
    type: SessionWithToken,
  })
  @Post('@loginByOAuth')
  async loginByOAuth(@Body() dto: OAuthDto): Promise<SessionWithToken> {
    const { provider, code, grantType: grant_type, redirectUri: redirect_uri } = dto;
    const clientId = config.oauthProvider.clientId(provider);
    const clientSecret = config.oauthProvider.clientSecret(provider);
    const accessTokenUrl = config.oauthProvider.accessTokenUrl(provider);
    const getTokenUseQuery = config.oauthProvider.getTokenUseQuery(provider);

    assertHttp(!!clientId, `clientId of ${provider} not found.`);
    assertHttp(!!clientSecret, `clientSecret of ${provider} not found.`);
    assertHttp(!!accessTokenUrl, `accessTokenUrl of ${provider} not found.`);

    const result = await this.oauthService.getAccessToken(accessTokenUrl, {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type,
      redirect_uri,
      getTokenUseQuery,
    });
    const expireAt = result.expires_in ? Date.now() + result.expires_in * 1000 : undefined;
    const refreshTokenExpireAt = result.refresh_token_expires_in
      ? Date.now() + result.refresh_token_expires_in * 1000
      : undefined;

    // 获取第三方的用户信息
    const userInfoUrl = config.oauthProvider.userInfoUrl(provider);
    assertHttp(!!userInfoUrl, `userInfoUrl of ${provider} not found.`);
    const userInfo = await this.oauthService.getUserInfo(userInfoUrl, result.access_token);

    // 创建或更新第三方数据
    const tidField = config.oauthProvider.tidField(provider);
    assertHttp(!!tidField, `tidField of ${provider} not found.`);
    const tid = get(userInfo, tidField);
    const thirdParty = await this.thirdPartyService.upsert(tid, provider, {
      tid,
      source: provider,
      accessToken: result.access_token,
      expireAt,
      tokenType: result.token_type,
      refreshToken: result.refresh_token,
      refreshTokenExpireAt,
      data: JSON.stringify(userInfo),
    });

    // 已绑定用户
    if (thirdParty.uid) {
      const user = await this.userService.get(thirdParty.uid);
      if (!user) {
        throw new UnauthorizedException({
          code: ErrorCodes.AUTH_FAILED,
          message: `user not found.`,
        });
      }

      return this._login(user);
    }

    // 未绑定用户
    return this._loginByThirdParty(thirdParty);
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
    await this.sessionService.delete(dto.sid);
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
        code: ErrorCodes.USER_NOT_FOUND,
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
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'The session with token has been successfully refreshed.',
    type: SessionWithToken,
  })
  @Post('@refresh')
  async refresh(@Body() dto: RefreshTokenDto): Promise<SessionWithToken> {
    let session = await this.sessionService.findByRefreshToken(dto.refreshToken);
    if (!session) {
      throw new UnauthorizedException({
        code: ErrorCodes.SESSION_NOT_FOUND,
        message: `session with refresh token ${dto.refreshToken} not found.`,
      });
    }

    if (session.refreshTokenExpireAt.getTime() < Date.now()) {
      throw new UnauthorizedException({
        code: ErrorCodes.SESSION_EXPIRED,
        message: 'Session has been expired.',
      });
    }

    const payload = {
      source: session.source,
      ns: session.ns,
      groups: session.groups,
      type: session.type,
      permissions: session.permissions,
    };

    if (session.shouldRotate()) {
      session = await this.sessionService.create({
        ...payload,
        subject: session.subject,
        refreshTokenExpireAt: addShortTimeSpan(config.auth.refreshTokenExpiresIn),
      } as CreateSessionDto);
    }

    const jwtpayload: JwtPayload = {
      ...payload,
      sid: session.id,
    };

    const tokenExpireAt = addShortTimeSpan(config.auth.tokenExpiresIn);
    const token = this.jwtService.sign(jwtpayload, {
      expiresIn: config.auth.tokenExpiresIn,
      subject: session.subject,
    });

    return {
      ...session.toJSON(),
      token,
      tokenExpireAt,
    };
  }

  /**
   * Reset password by phone
   */
  @ApiOperation({ operationId: 'resetPasswordByPhone' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('@resetPasswordByPhone')
  async resetPasswordByPhone(@Body() dto: ResetPasswordByPhoneDto): Promise<void> {
    const user = await this.userService.findByPhone(dto.phone);
    if (!user) {
      throw new NotFoundException({
        code: ErrorCodes.USER_NOT_FOUND,
        message: `User with phone ${dto.phone} not found.`,
      });
    }

    if (!(await this.captchaService.consume(dto.key, dto.code))) {
      throw new BadRequestException({
        code: ErrorCodes.CAPTCHA_INVALID,
        message: 'captcha invalid.',
      });
    }

    await this.userService.updatePassword(user.id, dto.password);
  }

  /**
   * Reset password by email
   */
  @ApiOperation({ operationId: 'resetPasswordByEmail' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('@resetPasswordByEmail')
  async resetPasswordByEmail(@Body() dto: ResetPasswordByEmailDto): Promise<void> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new NotFoundException({
        code: ErrorCodes.USER_NOT_FOUND,
        message: `User with email ${dto.email} not found.`,
      });
    }

    if (!(await this.captchaService.consume(dto.key, dto.code))) {
      throw new BadRequestException({
        code: ErrorCodes.CAPTCHA_INVALID,
        message: 'captcha invalid.',
      });
    }

    await this.userService.updatePassword(user.id, dto.password);
  }
}
