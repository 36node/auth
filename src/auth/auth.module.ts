import fs from 'fs';

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { CaptchaModule } from 'src/captcha';
import * as config from 'src/config';
import { EmailModule } from 'src/email';
import { GroupModule } from 'src/group';
import { NamespaceModule } from 'src/namespace';
import { OAuthModule } from 'src/oauth';
import { RedisModule } from 'src/redis';
import { SessionModule } from 'src/session';
import { SmsModule } from 'src/sms';
import { ThirdPartyModule } from 'src/third-party/third-party.module';
import { UserModule } from 'src/user';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      ...(config.auth.jwtSecretKey
        ? {
            secret: config.auth.jwtSecretKey,
            signOptions: {
              allowInsecureKeySizes: true,
              algorithm: 'HS256',
            },
          }
        : {
            privateKey: fs.readFileSync('ssl/private.key', 'utf-8'),
            signOptions: {
              allowInsecureKeySizes: true,
              algorithm: 'RS256',
            },
          }),
    }),
    UserModule,
    SessionModule,
    NamespaceModule,
    GroupModule,
    CaptchaModule,
    RedisModule,
    EmailModule,
    SmsModule,
    ThirdPartyModule,
    OAuthModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [],
})
export class AuthModule {}
