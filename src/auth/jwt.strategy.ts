import fs from 'fs';

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { PassportAuth } from './dto/passport-request.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: fs.readFileSync('ssl/public.key', 'utf-8'),
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any): Promise<PassportAuth> {
    const payloadRoles = payload.roles || [];
    return {
      subject: payload.sub,
      ns: payload.ns,
      roles: payloadRoles,
      acl: payload.acl,
      super: payload.super,
    };
  }
}
