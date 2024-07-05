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
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';

import { ErrorCodes } from './constants';
import { CreateSmsRecordDto } from './dto/create-sms-record.dto';
import { ListSmsRecordQuery } from './dto/list-sms-record.dto';
import { UpdateSmsRecordDto } from './dto/update-sms-record.dto';
import { SmsRecord, SmsRecordDocument } from './entities/sms-record.entity';
import { SmsRecordService } from './sms-record.service';

@ApiTags('smsRecord')
@ApiBearerAuth()
@Controller('sms/records')
export class SmsRecordController {
  constructor(private readonly smsRecordService: SmsRecordService) {}

  /**
   * Create sms record
   */
  @ApiOperation({ operationId: 'createSmsRecord' })
  @ApiCreatedResponse({
    description: 'The sms record has been successfully created.',
    type: SmsRecord,
  })
  @Post()
  create(@Body() createDto: CreateSmsRecordDto) {
    return this.smsRecordService.create(createDto);
  }

  /**
   * List sms records
   */
  @ApiOperation({ operationId: 'listSmsRecords' })
  @ApiOkResponse({
    description: 'A paged array of sms records.',
    type: [SmsRecord],
  })
  @Get()
  async list(@Req() req: Request, @Query() query: ListSmsRecordQuery, @Res() res: Response) {
    const count = await this.smsRecordService.count(query);
    const data = await this.smsRecordService.list(query);
    res.set({ 'X-Total-Count': count.toString() }).json(data);
    return data;
  }

  /**
   * Find sms record by id
   */
  @ApiOperation({ operationId: 'getSmsRecord' })
  @ApiOkResponse({
    description: 'The sms record with expected id.',
    type: SmsRecord,
  })
  @ApiParam({
    name: 'smsRecordId',
    type: 'string',
    description: 'Sms record id',
  })
  @Get(':smsRecordId')
  async get(@Param('smsRecordId') smsRecordId: string): Promise<SmsRecordDocument> {
    const smsRecord = await this.smsRecordService.get(smsRecordId);
    if (!smsRecord) {
      throw new NotFoundException({
        code: ErrorCodes.SMS_RECORD_NOT_FOUND,
        message: `Sms record with id ${smsRecordId} not found`,
      });
    }
    return smsRecord;
  }

  /**
   * Update sms record
   */
  @ApiOperation({ operationId: 'updateSmsRecord' })
  @ApiOkResponse({
    description: 'The sms record updated.',
    type: SmsRecord,
  })
  @Patch(':smsRecordId')
  async update(@Param('smsRecordId') smsRecordId: string, @Body() updateDto: UpdateSmsRecordDto) {
    const smsRecord = await this.smsRecordService.update(smsRecordId, updateDto);
    if (!smsRecord) {
      throw new NotFoundException({
        code: ErrorCodes.SMS_RECORD_NOT_FOUND,
        message: `Sms record with id ${smsRecordId} not found`,
      });
    }
    return smsRecord;
  }

  /**
   * Delete sms record
   */
  @ApiOperation({ operationId: 'deleteSmsRecord' })
  @ApiNoContentResponse({ description: 'No content.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':smsRecordId')
  async delete(@Param('smsRecordId') smsRecordId: string) {
    await this.smsRecordService.delete(smsRecordId);
  }
}
