import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import { Model } from 'mongoose';

import { settings } from 'src/config';

import { CreateCaptchaDto, UpsertCaptchaDto } from './dto/create-captcha.dto';
import { getCaptchaByKeyDto } from './dto/get-captcha.dto';
import { UpdateCaptchaDto } from './dto/update-captcha.dto';
import { Captcha, CaptchaDocument } from './entities/captcha.entity';

@Injectable()
export class CaptchaService {
  constructor(@InjectModel(Captcha.name) private readonly captchaModel: Model<CaptchaDocument>) {}

  create(createDto: CreateCaptchaDto) {
    const createdCaptcha = new this.captchaModel(createDto);
    return createdCaptcha.save();
  }

  upsertByKey(key: string, scope: string, upsertDto: UpsertCaptchaDto) {
    return this.captchaModel
      .findOneAndUpdate(
        { key, scope },
        {
          ...upsertDto,
          expireAt: dayjs().add(settings.captcha.expireAt, 'second').toDate(),
        },
        { upsert: true, new: true }
      )
      .exec();
  }

  get(id: string): Promise<CaptchaDocument> {
    return this.captchaModel.findById(id).exec();
  }

  getByKey(key: string, scope: string, filter?: getCaptchaByKeyDto): Promise<CaptchaDocument> {
    return this.captchaModel
      .findOne({
        key,
        scope,
        ...filter,
        expireAt: { $gt: dayjs().toDate() },
      })
      .exec();
  }

  update(id: string, updateDto: UpdateCaptchaDto): Promise<CaptchaDocument> {
    return this.captchaModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  delete(id: string) {
    return this.captchaModel.findByIdAndDelete(id).exec();
  }

  generateCaptcha(length: number) {
    const set = '0123456789';
    const setLen = set.length;

    let code = '';
    for (let i = 0; i < length; i++) {
      const p = Math.floor(Math.random() * setLen);
      code += set[p];
    }
    return code;
  }
}
