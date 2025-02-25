import { Module } from '@nestjs/common';

import { OAuthService } from './oauth.service';

@Module({
  imports: [],
  controllers: [],
  providers: [OAuthService],
  exports: [OAuthService],
})
export class OAuthModule {}
