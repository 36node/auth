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
  Patch,
  Post,
  Req,
  Request,
  UseGuards,
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
import { get } from 'lodash';

import {
  EmailAuthGuard,
  JwtPayload,
  LocalAuthGuard,
  PhoneAuthGuard,
  RequestWithPassport,
} from 'src/auth';
import { CaptchaPurpose, WithCaptchaGuard } from 'src/captcha';
import { errCodes, Public } from 'src/common';
import { getScope } from 'src/lib/lang/string';
import { addShortTimeSpan } from 'src/lib/lang/time';
import { Namespace, NamespaceService } from 'src/namespace';
import {
  LoginSessionByEmailDto,
  LoginSessionByPhoneDto,
  LoginSessionDto,
  RefreshSessionDto,
  SessionService,
  SessionWithToken,
} from 'src/session';
import { LogoutSessionDto } from 'src/session/dto/logout-session.dto';
import { UserService } from 'src/user';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { Identity, UserDocument } from 'src/user/entities/user.entity';
import { VerifyIdentityService } from 'src/user/verify-identity.service';

import {
  RegisterUserByEmailDto,
  RegisterUserByPhoneDto,
  RegisterUserByUsernameDto,
} from './dto/register.dto';
import { ResetMyPasswordDto } from './dto/reset-password.dto';
import { UpdateMyInfoDto } from './dto/update-info.dto';
import { UpdateMyPasswordDto } from './dto/update-me-password.dto';
import { UpdateMyEmailDto, UpdateMyPhoneDto } from './dto/update-phone-email.dto';
import { VerifyIdentityDto } from './dto/verify-identity.dto';
import { MyInfo } from './entities/my-info.entity';

const LOGIN_SESSION_EXPIRES_IN = '7d';
const LOGIN_TOKEN_EXPIRES_IN = '1d';
const DEFAULT_TOKEN_EXPIRES_IN = '1h';

const assertUser = (user: UserDocument) => {
  if (!user) {
    throw new NotFoundException({
      code: errCodes.USER_NOT_FOUND,
      message: `user not found.`,
    });
  }
};

@ApiTags('me')
@ApiBearerAuth()
@Controller('me')
export class MeController {
  constructor(
    private readonly userService: UserService,
    private readonly namespaceService: NamespaceService,
    private readonly sessionService: SessionService,
    private jwtService: JwtService,
    private readonly verifyIdentityService: VerifyIdentityService
  ) {}

  private async sessionForLogon(userId: string, hasPassword: boolean): Promise<SessionWithToken> {
    const session = await this.sessionService.create({
      uid: userId,
      expireAt: addShortTimeSpan(LOGIN_SESSION_EXPIRES_IN),
      tokenExpiresIn: LOGIN_TOKEN_EXPIRES_IN,
    });

    const jwtpayload: JwtPayload = {
      roles: session.user.roles,
      ns: session.user.ns,
      super: session.user.super,
    };
    const token = this.jwtService.sign(jwtpayload, {
      expiresIn: LOGIN_TOKEN_EXPIRES_IN,
      subject: session.user.id,
    });
    const tokenExpireAt = addShortTimeSpan(LOGIN_TOKEN_EXPIRES_IN);

    const res: SessionWithToken = {
      ...session.toJSON(),
      token,
      tokenExpireAt,
    };

    res.user.hasPassword = hasPassword;
    return res;
  }

  /**
   * Get my info
   */
  @ApiOperation({ operationId: 'getMyInfo' })
  @ApiOkResponse({
    description: 'The info of mine.',
    type: MyInfo,
  })
  @Get('info')
  async getInfo(@Req() req: RequestWithPassport) {
    const me = await this.userService.get(req.user.subject, { password: true });
    assertUser(me);
    return { ...me.toJSON(), hasPassword: Boolean(get(me, '_password')) };
  }

  /**
   * Update my info
   */
  @ApiOperation({ operationId: 'updateMyInfo' })
  @ApiOkResponse({
    description: 'The info of mine has been updated.',
    type: MyInfo,
  })
  @Patch('info')
  async updateInfo(@Req() req: RequestWithPassport, @Body() updateDto: UpdateMyInfoDto) {
    await this.userService.update(req.user.subject, updateDto);
    const me = await this.userService.findByIdWithPassword(req.user.subject);
    assertUser(me);
    return { ...me.toJSON(), hasPassword: Boolean(get(me, '_password')) };
  }

  /**
   * Update my password
   */
  @ApiOperation({ operationId: 'updateMyPassword' })
  @ApiOkResponse({
    description: 'The password of mine has been updated.',
    type: MyInfo,
  })
  @Patch('password')
  async updatePassword(@Req() req: RequestWithPassport, @Body() updateDto: UpdateMyPasswordDto) {
    const me = await this.userService.findByIdWithPassword(req.user.subject);
    assertUser(me);

    const { oldPassword, newPassword } = updateDto;

    const hasPassword = Boolean(get(me, '_password'));

    if (!hasPassword) {
      me.password = newPassword;
      await me.save();
      return { ...me.toJSON(), hasPassword: true };
    }

    if (!(await me.checkPassword(oldPassword))) {
      throw new ForbiddenException({
        code: errCodes.USER_OR_PASSWORD_ERROR,
        message: `Old passwords do not match`,
        details: [
          {
            message: `Old passwords do not match`,
            field: 'oldPassword',
          },
        ],
      });
    }

    // 验证密码强度
    const scope = await this.namespaceService.getByFullPath(getScope(me?.ns));
    this.namespaceService.passwordValidate(newPassword, scope?.passwordRegExp, 'newPassword');

    me.password = newPassword;
    await me.save();
    return { ...me.toJSON(), hasPassword: true };
  }

  /**
   * Reset my password
   */
  @ApiOperation({ operationId: 'resetMyPassword' })
  @ApiOkResponse({
    description: 'The password of mine has been reset.',
    type: MyInfo,
  })
  @Public()
  @WithCaptchaGuard(CaptchaPurpose.RESET_PASSWORD)
  @Post('@resetPassword')
  async resetPassword(@Body() resetDto: ResetMyPasswordDto) {
    const { phone, email, scope, newPassword, dialingPrefix } = resetDto;
    let me: UserDocument;
    if (phone) {
      me = await this.userService.findByLoginWithPhone(phone, dialingPrefix, scope);
    } else if (email) {
      me = await this.userService.findByLoginWithEmail(email, scope);
    }

    if (!me) {
      throw new NotFoundException({
        code: errCodes.USER_NOT_FOUND,
        message: `User ${phone || email} not found in scope ${scope}.`,
        details: [
          {
            message: `User ${phone || email} not found in scope ${scope}.`,
            field: 'phone',
          },
          {
            message: `User ${phone || email} not found in scope ${scope}.`,
            field: 'email',
          },
        ],
      });
    }

    // 验证密码强度
    const namespace = await this.namespaceService.getByFullPath(scope);
    this.namespaceService.passwordValidate(newPassword, namespace?.passwordRegExp, 'newPassword');

    me.password = newPassword;
    await me.save();
    return { ...me.toJSON(), hasPassword: true };
  }

  /**
   * Register user by phone
   */
  @ApiOperation({ operationId: 'registerUserByPhone' })
  @ApiCreatedResponse({
    description: 'The user has been successfully created.',
    type: SessionWithToken,
  })
  @Public()
  @WithCaptchaGuard(CaptchaPurpose.REGISTER)
  @Post('@registerByPhone')
  async registerByPhone(@Body() dto: RegisterUserByPhoneDto) {
    const { scope, phone, dialingPrefix, password } = dto;
    const createBody: CreateUserDto = { phone, ns: scope, dialingPrefix };
    const namespace = await this.namespaceService.getByFullPath(scope);

    // 增加默认角色
    if (namespace.registerDefaultRoles) {
      createBody.roles = namespace.registerDefaultRoles;
    }

    if (password) {
      this.namespaceService.passwordValidate(password, namespace?.passwordRegExp);
    }

    const user = await this.userService.create(createBody);

    if (password) {
      user.password = password;
      await user.save();
    }

    return this.sessionForLogon(user.id, Boolean(password));
  }

  /**
   * Register user by email
   */
  @ApiOperation({ operationId: 'registerUserByEmail' })
  @ApiCreatedResponse({
    description: 'The user has been successfully created.',
    type: SessionWithToken,
  })
  @Public()
  @WithCaptchaGuard(CaptchaPurpose.REGISTER)
  @Post('@registerByEmail')
  async registerByEmail(@Body() dto: RegisterUserByEmailDto) {
    const { scope, email, password } = dto;
    const createBody: CreateUserDto = { email, ns: scope };
    const namespace = await this.namespaceService.getByFullPath(scope);

    // 增加默认角色
    if (namespace.registerDefaultRoles) {
      createBody.roles = namespace.registerDefaultRoles;
    }

    if (password) {
      this.namespaceService.passwordValidate(password, namespace?.passwordRegExp);
    }

    const user = await this.userService.create(createBody);

    if (password) {
      user.password = password;
      await user.save();
    }

    return this.sessionForLogon(user.id, Boolean(password));
  }

  /**
   * Register user by username and password
   */
  @ApiOperation({ operationId: 'register' })
  @ApiCreatedResponse({
    description: 'The user has been successfully created.',
    type: SessionWithToken,
  })
  @Public()
  @Post('@register')
  async register(@Body() dto: RegisterUserByUsernameDto) {
    const { scope, username, password } = dto;
    const createBody: CreateUserDto = { username, ns: scope };
    if (scope) {
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

      // 验证密码强度
      this.namespaceService.passwordValidate(password, namespace.passwordRegExp);

      // 增加默认角色
      if (namespace.registerDefaultRoles) {
        createBody.roles = namespace.registerDefaultRoles;
      }
    }

    const user = await this.userService.create(createBody);
    user.password = password;
    user.save();
    return this.sessionForLogon(user.id, true);
  }

  /**
   * 通过 username、email / password 登录
   *
   * @param req
   * @param loginSessionDto
   * @returns session
   */
  @ApiOperation({ operationId: 'login' })
  @ApiCreatedResponse({
    description: 'The session which is created by login.',
    type: SessionWithToken,
  })
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('@login')
  @HttpCode(200)
  async login(
    @Request() req: RequestWithPassport,
    @Body() body: LoginSessionDto // eslint-disable-line
  ): Promise<SessionWithToken> {
    const userId = get(req, 'user.subject');
    const user = await this.userService.findByIdWithPassword(userId);

    return this.sessionForLogon(userId, Boolean(get(user, '_password')));
  }

  /**
   * 通过 phone / captcha 登录
   *
   * @param req
   * @param LoginSessionByPhoneDto
   * @returns session
   */
  @ApiOperation({ operationId: 'loginByPhone' })
  @ApiCreatedResponse({
    description: 'The session which is created by login.',
    type: SessionWithToken,
  })
  @Public()
  @WithCaptchaGuard(CaptchaPurpose.LOGIN, PhoneAuthGuard)
  @Post('@loginByPhone')
  @HttpCode(200)
  async loginByPhone(
    @Request() req: RequestWithPassport,
    @Body() body: LoginSessionByPhoneDto
  ): Promise<SessionWithToken> {
    let userId = get(req, 'user.subject');

    if (!userId) {
      // 需要创建用户
      const { phone, scope, dialingPrefix } = body;
      let namespace: Namespace;
      if (scope) {
        namespace = await this.namespaceService.getByFullPath(scope);
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
      }

      const user = await this.userService.create({
        phone,
        ns: scope,
        dialingPrefix,
        roles: namespace?.registerDefaultRoles || [],
      });
      userId = user.id;
    }

    const user = await this.userService.findByIdWithPassword(userId);
    return this.sessionForLogon(userId, Boolean(get(user, '_password')));
  }

  /**
   * 通过 email / captcha 登录
   *
   * @param req
   * @param LoginSessionByEmailDto
   * @returns session
   */
  @ApiOperation({ operationId: 'loginByEmail' })
  @ApiCreatedResponse({
    description: 'The session which is created by login.',
    type: SessionWithToken,
  })
  @Public()
  @WithCaptchaGuard(CaptchaPurpose.LOGIN, EmailAuthGuard)
  @Post('@loginByEmail')
  @HttpCode(200)
  async loginByEmail(
    @Request() req: RequestWithPassport,
    @Body() body: LoginSessionByEmailDto
  ): Promise<SessionWithToken> {
    let userId = get(req, 'user.subject');
    if (!userId) {
      // 需要创建用户
      const { email, scope } = body;
      let namespace: Namespace;
      if (scope) {
        namespace = await this.namespaceService.getByFullPath(scope);
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
      }

      const user = await this.userService.create({
        email,
        ns: scope,
        roles: namespace?.registerDefaultRoles || [],
      });
      userId = user.id;
    }

    const user = await this.userService.findByIdWithPassword(userId);
    return this.sessionForLogon(userId, Boolean(get(user, '_password')));
  }

  /**
   * 更新email
   *
   * @param UpdateMyEmailDto
   * @returns MyInfo
   */
  @ApiOperation({ operationId: 'updateMyEmail' })
  @ApiOkResponse({
    description: 'The email of mine has been updated.',
    type: MyInfo,
  })
  @WithCaptchaGuard(CaptchaPurpose.UPDATE_EMAIL)
  @Patch('email')
  async updateEmail(@Request() req: RequestWithPassport, @Body() updateDto: UpdateMyEmailDto) {
    await this.userService.update(req.user.subject, { email: updateDto.email });
    const me = await this.userService.findByIdWithPassword(req.user.subject);
    assertUser(me);
    return { ...me.toJSON(), hasPassword: Boolean(get(me, '_password')) };
  }

  /**
   * 更新phone
   *
   * @param UpdateMyPhoneDto
   * @returns MyInfo
   */
  @ApiOperation({ operationId: 'updateMyPhone' })
  @ApiOkResponse({
    description: 'The phone number of mine has been updated.',
    type: MyInfo,
  })
  @WithCaptchaGuard(CaptchaPurpose.UPDATE_PHONE)
  @Patch('phone')
  async updatePhone(@Request() req: RequestWithPassport, @Body() updateDto: UpdateMyPhoneDto) {
    await this.userService.update(req.user.subject, { phone: updateDto.phone });
    const me = await this.userService.findByIdWithPassword(req.user.subject);
    assertUser(me);
    return { ...me.toJSON(), hasPassword: Boolean(get(me, '_password')) };
  }

  /**
   * 根据 session key 登出
   *
   * @param req
   * @param logoutSessionDto
   * @returns session
   */
  @ApiOperation({ operationId: 'logout' })
  @ApiNoContentResponse({ description: 'No content.' })
  @Post('@logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Request() req: RequestWithPassport, @Body() body: LogoutSessionDto): Promise<void> {
    const session = await this.sessionService.findByKey(body.key);
    if (!session) {
      throw new NotFoundException({
        code: errCodes.SESSION_NOT_FOUND,
        message: `key ${body.key} not found.`,
        details: [
          {
            message: `key ${body.key} not found.`,
            field: 'key',
          },
        ],
      });
    }

    if (session.user.id !== req.user.subject) {
      throw new ForbiddenException({
        code: errCodes.SESSION_CANNOT_BE_DELETED,
        message: 'You can only delete your own session.',
      });
    }

    await this.sessionService.delete(session.id);
  }

  /**
   * 根据 key 刷新 Session
   *
   * key 是用户的授权令牌，token 是用户访问资源的凭证
   *
   * @param refreshSessionDto
   * @returns session
   */
  @ApiOperation({ operationId: 'refreshSession' })
  @ApiCreatedResponse({
    description: 'The session has been successfully refreshed.',
    type: SessionWithToken,
  })
  @Public()
  @Post('@refresh')
  @HttpCode(200)
  async refresh(@Body() refreshSessionDto: RefreshSessionDto): Promise<SessionWithToken> {
    let session = await this.sessionService.findByKey(refreshSessionDto.key);
    if (!session) {
      throw new NotFoundException({
        code: errCodes.SESSION_NOT_FOUND,
        message: `key ${refreshSessionDto.key} not found.`,
        details: [
          {
            message: `key ${refreshSessionDto.key} not found.`,
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

    if (session.shouldRotate()) {
      const duration = session.expireAt.getTime() - session.createAt?.getTime();
      session = await this.sessionService.create({
        uid: session.user.id,
        expireAt: new Date(Date.now() + duration),
        tokenExpiresIn: session.tokenExpiresIn,
        acl: session.acl,
      });
    }

    const expiresIn = session.tokenExpiresIn || DEFAULT_TOKEN_EXPIRES_IN;
    const jwtpayload: JwtPayload = {
      roles: session.user.roles,
      ns: session.user.ns,
      super: session.user.super,
      acl: session.acl,
    };
    const token = this.jwtService.sign(jwtpayload, { expiresIn, subject: session.user.id });
    const tokenExpireAt = addShortTimeSpan(expiresIn);

    const me = await this.userService.findByIdWithPassword(session.user.id);
    assertUser(me);

    const res: SessionWithToken = {
      ...session.toJSON(),
      token,
      tokenExpireAt,
    };

    res.user.hasPassword = Boolean(get(me, '_password'));
    return res;
  }

  /**
   * 用户实名认证
   *
   * @param verifyIdentityDto
   * @returns Identity
   */
  @ApiOperation({ operationId: 'verifyIdentity' })
  @ApiCreatedResponse({
    description: 'The user has been identity verified.',
    type: Identity,
  })
  @Post('@verifyIdentity')
  @HttpCode(200)
  async verifyIdentity(
    @Request() req: RequestWithPassport,
    @Body() verifyIdentityDto: VerifyIdentityDto
  ): Promise<Identity> {
    const me = await this.userService.get(req.user.subject);
    assertUser(me);

    if (me.identity.verified) {
      throw new ConflictException({
        code: errCodes.IDENTITY_ALREADY_VERIFIED,
        message: `Identity verified`,
      });
    }

    const isVerified = await this.verifyIdentityService.verify(
      verifyIdentityDto.name,
      verifyIdentityDto.identity
    );

    if (!isVerified) {
      throw new BadRequestException({
        code: errCodes.IDENTITY_VERIFY_FAILED,
        message: `Identity verify failed`,
      });
    }

    await this.userService.updateIdentity(req.user.subject, {
      name: verifyIdentityDto.name,
      type: verifyIdentityDto.type,
    });

    return {
      name: verifyIdentityDto.name,
      type: verifyIdentityDto.type,
      verifyAt: new Date(),
      verified: true,
    };
  }
}
