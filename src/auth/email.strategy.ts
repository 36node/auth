import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { validateOrReject } from 'class-validator';
import { Request } from 'express';
import { Strategy } from 'passport-local';

import { errCodes } from 'src/common';
import { settings } from 'src/config';
import { LoginSessionByEmailDto } from 'src/session/dto/login-session.dto';
import { UserService } from 'src/user';

import { PassportAuth } from './dto/passport-request.dto';

@Injectable()
export class EmailStrategy extends PassportStrategy(Strategy, 'email') {
  constructor(private userService: UserService) {
    super({ usernameField: 'email', passwordField: 'code', passReqToCallback: true });
  }

  async validate(request: Request, email: string, code: string): Promise<PassportAuth> {
    const dto = new LoginSessionByEmailDto();
    dto.email = email;
    dto.code = code;
    dto.scope = request.body.scope;

    try {
      await validateOrReject(dto);
    } catch (errors) {
      let message = [];
      for (const error of errors) {
        message = message.concat(Object.values(error.constraints || {}));
      }
      throw new BadRequestException({ message, code: errCodes.VALIDATION_FAILED });
    }

    const user = await this.userService.findByLoginWithEmail(email, request.body.scope);
    if (!user) {
      if (settings.registerOnLogin) {
        return {} as PassportAuth;
      }

      throw new UnauthorizedException({
        message: 'User email wrong',
        code: 'USER_EMAIL_WRONG',
      });
    }

    return {
      subject: user.id,
      ns: user.ns,
      roles: user.roles,
    };
  }
}
