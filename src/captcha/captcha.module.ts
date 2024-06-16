import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EmailModule } from 'src/email';
import { NamespaceModule } from 'src/namespace';

import { CaptchaController } from './captcha.controller';
import { CaptchaService } from './captcha.service';
import { Captcha, CaptchaSchema } from './entities/captcha.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Captcha.name, schema: CaptchaSchema }]),
    NamespaceModule,
    EmailModule,
  ],
  controllers: [CaptchaController],
  providers: [CaptchaService],
  exports: [CaptchaService],
})
export class CaptchaModule {}
