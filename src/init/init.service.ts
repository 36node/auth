import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';

import { settings } from 'src/config';
import { NamespaceDocument, NamespaceService } from 'src/namespace';
import { SessionService } from 'src/session';
import { UserService } from 'src/user';
import { UserDocument } from 'src/user/entities/user.entity';

@Injectable()
export class InitService {
  constructor(
    private readonly sessionService: SessionService,
    private readonly nsService: NamespaceService,
    private readonly userService: UserService
  ) {}

  async init() {
    let initUser: UserDocument;
    let initNamespace: NamespaceDocument;

    if (settings.init.namespace) {
      initNamespace = await this.nsService.get(settings.init.namespace.key);
      if (!initNamespace) initNamespace = await this.nsService.upsert(settings.init.namespace);
    }

    if (settings.init.user) {
      initUser = await this.userService.findByLogin(settings.init.user.username);
      if (!initUser) {
        // 用 upsert 防止并发错误
        initUser = await this.userService.upsert({ ...settings.init.user, ns: initNamespace?.key });
        // upsert 不会触发 virtual 方法
        initUser.password = settings.init.user.password;
        await initUser.save();
      }
    }

    if (settings.init.key) {
      await this.sessionService.upsertByKey(settings.init.key, {
        uid: initUser?.id,
        expireAt: dayjs().add(100, 'year').toDate(),
      });
    }

    if (settings.preset.enabled) {
      if (settings.preset.namespace) {
        const presetNamespace = await this.nsService.get(settings.preset.namespace.key);
        if (!presetNamespace) await this.nsService.upsert(settings.preset.namespace);
      }

      if (settings.preset.users) {
        await Promise.all(
          settings.preset.users.map(async (item) => {
            const user = await this.userService.upsert(item);
            user.password = item.password;
            await user.save();
          })
        );
      }
    }
  }
}
