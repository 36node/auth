import { Module } from '@nestjs/common';

import { NamespaceModule } from 'src/namespace';
import { SessionModule } from 'src/session';
import { UserModule } from 'src/user';

import { InitController } from './init.controller';
import { InitService } from './init.service';

@Module({
  imports: [NamespaceModule, SessionModule, UserModule],
  controllers: [InitController],
  providers: [InitService],
  exports: [],
})
export class InitModule {
  constructor(private readonly initService: InitService) {}
  async onModuleInit() {
    await this.initService.init();
  }
}
