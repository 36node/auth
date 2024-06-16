import { Module } from '@nestjs/common';

import { CaptchaModule } from 'src/captcha';
import { NamespaceModule } from 'src/namespace';
import { SessionModule } from 'src/session';
import { UserModule } from 'src/user';

import { MeController } from './me.controller';

@Module({
  imports: [UserModule, CaptchaModule, NamespaceModule, SessionModule],
  controllers: [MeController],
  providers: [],
  exports: [],
})
export class MeModule {}
