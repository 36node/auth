import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { validateOrReject } from 'class-validator';
import { Request } from 'express';
import { Strategy } from 'passport-local';

import { errCodes } from 'src/common';
import { LoginSessionDto } from 'src/session/dto/login-session.dto';
import { UserService } from 'src/user';

import { PassportAuth } from './dto/passport-request.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({ usernameField: 'login', passReqToCallback: true });
  }

  async validate(request: Request, login: string, password: string): Promise<PassportAuth> {
    const dto = new LoginSessionDto();
    dto.login = login;
    dto.password = password;
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

    const user = await this.userService.findByLoginWithPassword(login, request.body.scope);
    if (!user || !(await user.checkPassword(password))) {
      throw new UnauthorizedException({
        message: 'User or password wrong',
        code: 'USER_PASSWORD_WRONG',
      });
    }

    return {
      subject: user.id,
      ns: user.ns,
      roles: user.roles,
    };
  }
}
