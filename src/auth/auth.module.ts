import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { UserModule } from 'src/user';

import { EmailStrategy } from './email.strategy';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { PhoneStrategy } from './phone.strategy';

@Module({
  imports: [
    UserModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: false,
    }),
  ],
  providers: [JwtStrategy, LocalStrategy, PhoneStrategy, EmailStrategy],
  exports: [],
})
export class AuthModule {}
