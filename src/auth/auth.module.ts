import fs from 'fs';

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { CaptchaModule } from 'src/captcha';
import { SessionModule } from 'src/session';
import { UserModule } from 'src/user';

import { AuthController } from './auth.controller';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      privateKey: fs.readFileSync('ssl/private.key', 'utf-8'),
      signOptions: {
        allowInsecureKeySizes: true,
        algorithm: 'RS256',
        expiresIn: '60d',
      },
    }),
    UserModule,
    SessionModule,
    CaptchaModule,
  ],
  controllers: [AuthController],
  providers: [],
  exports: [],
})
export class AuthModule {}
