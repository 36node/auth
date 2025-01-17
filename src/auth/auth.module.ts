import fs from 'fs';

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { CaptchaModule } from 'src/captcha';
import * as config from 'src/constants';
import { EmailModule } from 'src/email';
import { GroupModule } from 'src/group';
import { NamespaceModule } from 'src/namespace';
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
      secretOrPrivateKey: config.auth.jwtSecretKey ?? fs.readFileSync('ssl/private.key', 'utf-8'),
      signOptions: {
        allowInsecureKeySizes: true,
        algorithm: config.auth.jwtSecretKey ? 'HS256' : 'RS256',
      },
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
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [],
})
export class AuthModule {}
