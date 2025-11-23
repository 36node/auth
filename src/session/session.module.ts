import { Module, OnModuleInit } from '@nestjs/common';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { rootSession } from 'src/config';
import { addShortTimeSpan } from 'src/lib/lang/time';

import { Session, SessionDocument, SessionSchema } from './entities/session.entity';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }])],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule implements OnModuleInit {
  constructor(@InjectModel(Session.name) private readonly sessionModel: Model<SessionDocument>) {}

  async onModuleInit() {
    // 如果配置了 ROOT_SESSION_KEY，则创建或更新 rootSession
    if (rootSession.key) {
      const key = rootSession.key;
      const subject = 'root';
      const expireAt = addShortTimeSpan(rootSession.expires);

      await this.sessionModel
        .findOneAndUpdate(
          { key },
          {
            key,
            subject,
            expireAt,
            type: 'api-key',
            remark: 'Root session created by system',
          },
          { upsert: true, new: true }
        )
        .exec();

      console.log(
        `Root session initialized: key=${key}, subject=${subject}, expireAt=${expireAt.toISOString()}`
      );
    }
  }
}
