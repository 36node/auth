import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';

import { CaptchaService } from './captcha';
import { EmailRecordService } from './email/email-record.service';
import { GroupService } from './group';
import { NamespaceService } from './namespace';
import { SessionService } from './session';
import { SmsRecordService } from './sms';
import { UserService } from './user';

class AppResult {
  @ApiProperty({
    name: 'message',
    type: 'string',
  })
  message: string;
}

@ApiTags('app')
@Controller()
export class AppController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly userService: UserService,
    private readonly namespaceService: NamespaceService,
    private readonly groupService: GroupService,
    private readonly captchaService: CaptchaService,
    private readonly emailRecordService: EmailRecordService,
    private readonly smsRecordService: SmsRecordService
  ) {}

  /**
   * health check
   */
  @ApiOperation({ operationId: 'hello' })
  @ApiOkResponse({
    description: 'Hello!',
    type: AppResult,
  })
  @Get('/hello')
  getHello(): AppResult {
    return { message: 'Hello World!' };
  }

  /**
   * clearnup all data
   */
  @ApiOperation({ operationId: 'cleanup' })
  @ApiOkResponse({
    description: 'clean up result',
    type: AppResult,
  })
  @Get('/cleanup')
  async cleanup(): Promise<void> {
    await this.emailRecordService.cleanupAllData();
    await this.smsRecordService.cleanupAllData();
    await this.captchaService.cleanupAllData();
    await this.sessionService.cleanupAllData();
    await this.userService.cleanupAllData();
    await this.groupService.cleanupAllData();
    await this.namespaceService.cleanupAllData();
  }
}
