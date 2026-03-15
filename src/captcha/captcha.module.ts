import { Module, OnModuleInit } from '@nestjs/common';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CaptchaController } from './captcha.controller';
import { CaptchaService } from './captcha.service';
import { Captcha, CaptchaDocument, CaptchaSchema } from './entities/captcha.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: Captcha.name, schema: CaptchaSchema }])],
  controllers: [CaptchaController],
  providers: [CaptchaService],
  exports: [CaptchaService],
})
export class CaptchaModule implements OnModuleInit {
  constructor(@InjectModel(Captcha.name) private readonly captchaModel: Model<CaptchaDocument>) {}

  async onModuleInit() {
    await this.captchaModel.syncIndexes();
  }
}
