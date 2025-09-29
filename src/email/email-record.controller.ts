import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';

import { CountResult } from 'src/common';
import { ErrorCodes } from 'src/constants';

import { CreateEmailRecordDto } from './dto/create-email-record.dto';
import { ListEmailRecordsQuery } from './dto/list-email-records.dto';
import { UpdateEmailRecordDto } from './dto/update-email-record.dto';
import { EmailRecordService } from './email-record.service';
import { EmailRecord, EmailRecordDocument } from './entities/email-record.entity';

@ApiTags('emailRecord')
@ApiSecurity('ApiKey')
@Controller('email/records')
export class EmailRecordController {
  constructor(private readonly emailRecordService: EmailRecordService) {}

  /**
   * Create email record
   */
  @ApiOperation({ operationId: 'createEmailRecord' })
  @ApiCreatedResponse({
    description: 'The email record has been successfully created.',
    type: EmailRecord,
  })
  @Post()
  create(@Body() createDto: CreateEmailRecordDto) {
    return this.emailRecordService.create(createDto);
  }

  /**
   * List email records
   */
  @ApiOperation({ operationId: 'listEmailRecords' })
  @ApiOkResponse({
    description: 'A paged array of email records.',
    type: [EmailRecord],
  })
  @Get()
  list(@Query() query: ListEmailRecordsQuery) {
    return this.emailRecordService.list(query);
  }

  /**
   * Count email records
   */
  @ApiOperation({ operationId: 'countEmailRecords' })
  @ApiOkResponse({
    description: 'The count of email records.',
    type: CountResult,
  })
  @Post('@count')
  async count(@Query() query: ListEmailRecordsQuery): Promise<CountResult> {
    const count = await this.emailRecordService.count(query);
    return { count };
  }

  /**
   * Find email record by id
   */
  @ApiOperation({ operationId: 'getEmailRecord' })
  @ApiOkResponse({
    description: 'The email record with expected id.',
    type: EmailRecord,
  })
  @ApiParam({
    name: 'emailRecordId',
    type: 'string',
    description: 'Email record id',
  })
  @Get(':emailRecordId')
  async get(@Param('emailRecordId') emailRecordId: string): Promise<EmailRecordDocument> {
    const emailRecord = await this.emailRecordService.get(emailRecordId);
    if (!emailRecord) {
      throw new NotFoundException({
        code: ErrorCodes.EMAIL_RECORD_NOT_FOUND,
        message: `Email record with id ${emailRecordId} not found`,
      });
    }
    return emailRecord;
  }

  /**
   * Update email record
   */
  @ApiOperation({ operationId: 'updateEmailRecord' })
  @ApiOkResponse({
    description: 'The email record updated.',
    type: EmailRecord,
  })
  @Patch(':emailRecordId')
  async update(
    @Param('emailRecordId') emailRecordId: string,
    @Body() updateDto: UpdateEmailRecordDto
  ) {
    const emailRecord = await this.emailRecordService.update(emailRecordId, updateDto);
    if (!emailRecord) {
      throw new NotFoundException({
        code: ErrorCodes.EMAIL_RECORD_NOT_FOUND,
        message: `Email record with id ${emailRecordId} not found`,
      });
    }
    return emailRecord;
  }

  /**
   * Delete email record
   */
  @ApiOperation({ operationId: 'deleteEmailRecord' })
  @ApiNoContentResponse({ description: 'No content.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':emailRecordId')
  async delete(@Param('emailRecordId') emailRecordId: string) {
    await this.emailRecordService.delete(emailRecordId);
  }
}
