import { IntersectionType } from '@nestjs/swagger';

import { Session } from 'src/session';

export class Token {
  /**
   * token
   */
  token: string;

  /**
   * token 过期时间
   */
  tokenExpireAt: Date;
}

export class SessionWithToken extends IntersectionType(Session, Token) {}
