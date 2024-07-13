import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import { Model } from 'mongoose';

import { buildMongooseQuery } from 'src/mongo';

import * as config from './config';
import { CreateCaptchaDto } from './dto/create-captcha.dto';
import { getCaptchaByKeyDto } from './dto/get-captcha.dto';
import { ListCaptchasQuery } from './dto/list-captchas.dto';
import { UpdateCaptchaDto } from './dto/update-captcha.dto';
import { UpsertCaptchaDto } from './dto/upsert-captcha.dto';
import { Captcha, CaptchaDocument } from './entities/captcha.entity';

@Injectable()
export class CaptchaService {
  constructor(@InjectModel(Captcha.name) private readonly captchaModel: Model<CaptchaDocument>) {}

  create(createDto: CreateCaptchaDto) {
    if (!createDto.code) {
      createDto.code = this.generateCaptcha(config.codeLength);
    }
    const createdCaptcha = new this.captchaModel(createDto);
    return createdCaptcha.save();
  }

  count(query: ListCaptchasQuery): Promise<number> {
    const { filter } = buildMongooseQuery(query);
    return this.captchaModel.countDocuments(filter).exec();
  }

  list(query: ListCaptchasQuery): Promise<CaptchaDocument[]> {
    const { limit = 10, sort, offset = 0, filter } = buildMongooseQuery(query);
    return this.captchaModel.find(filter).sort(sort).skip(offset).limit(limit).exec();
  }

  get(id: string): Promise<CaptchaDocument> {
    return this.captchaModel.findById(id).exec();
  }

  getByKey(key: string, filter?: getCaptchaByKeyDto): Promise<CaptchaDocument> {
    return this.captchaModel
      .findOne({
        key,
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

  upsertByKey(key: string, upsertDto: UpsertCaptchaDto) {
    return this.captchaModel
      .findOneAndUpdate(
        { key },
        {
          ...upsertDto,
          expireAt: dayjs().add(config.expiresInS, 'second').toDate(),
        },
        { upsert: true, new: true }
      )
      .exec();
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

  async consume(key: string, code: string): Promise<boolean> {
    const found = await this.getByKey(key, { code });
    if (found) {
      await this.delete(found.id);
    }
    return !!found;
  }
}
