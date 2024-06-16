import { Module } from '@nestjs/common';

import { AccessControlService } from './access-control.service';

@Module({
  imports: [],
  controllers: [],
  providers: [AccessControlService],
  exports: [AccessControlService],
})
export class AccessControlModule {}
