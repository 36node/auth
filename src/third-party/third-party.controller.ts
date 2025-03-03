import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { ErrorCodes } from 'src/constants';
import { UserService } from 'src/user';

import { bindThirdPartyDto } from './dto/bind-third-party.dto';
import { createThirdPartyDto } from './dto/create-third-party.dto';
import { ListThirdPartyDto } from './dto/list-third-party.dto';
import { UpdateThirdPartyDto } from './dto/update-third-party.dto';
import { ThirdParty, ThirdPartyDocument } from './entities/third-party.entity';
import { ThirdPartyService } from './third-party.service';

@ApiTags('thirdParty')
@Controller('third-parties')
export class ThirdPartyController {
  constructor(
    private readonly thirdPartyService: ThirdPartyService,
    private readonly userService: UserService
  ) {}

  /**
   * create third party
   */
  @ApiOperation({ operationId: 'createThirdParty' })
  @ApiCreatedResponse({
    description: 'The third party has been successfully created.',
    type: ThirdParty,
  })
  @Post()
  async create(@Body() createDto: createThirdPartyDto): Promise<ThirdPartyDocument> {
    return this.thirdPartyService.create(createDto);
  }

  /**
   * list third party
   */
  @ApiOperation({ operationId: 'listThirdParty' })
  @ApiCreatedResponse({
    description: 'The third party record list.',
    type: [ThirdParty],
  })
  @Get()
  async list(
    @Query() query: ListThirdPartyDto,
    @Res() res: Response
  ): Promise<ThirdPartyDocument[]> {
    const count = await this.thirdPartyService.count(query);
    const data = await this.thirdPartyService.list(query);
    res.set('X-Total-Count', count.toString()).json(data);
    return data;
  }

  /**
   * get third party
   */
  @ApiOperation({ operationId: 'getThirdParty' })
  @ApiCreatedResponse({
    description: 'The third party.',
    type: ThirdParty,
  })
  @Get(':id')
  async get(@Param('id') id: string): Promise<ThirdPartyDocument> {
    return this.thirdPartyService.get(id);
  }

  /**
   * update third party
   */
  @ApiOperation({ operationId: 'updateThirdParty' })
  @ApiCreatedResponse({
    description: 'The third party has been successfully updated.',
    type: ThirdParty,
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateThirdPartyDto
  ): Promise<ThirdPartyDocument> {
    return this.thirdPartyService.update(id, updateDto);
  }

  /**
   * bind third party
   */
  @ApiOperation({ operationId: 'bindThirdParty' })
  @ApiCreatedResponse({
    description: 'The third party has been successfully binded.',
    type: ThirdParty,
  })
  @Post('@bind')
  async bind(@Body() bindDto: bindThirdPartyDto): Promise<ThirdPartyDocument> {
    const { username, password } = bindDto;
    //check user
    const user = await this.userService.findByUsername(username);
    if (!user) {
      throw new NotFoundException({
        code: ErrorCodes.USER_NOT_FOUND,
        message: `User ${username} not found`,
        details: [
          {
            message: `User ${username} not found`,
            field: 'third party',
          },
        ],
      });
    }
    if (user.password && (!password || !this.userService.checkPassword(user.password, password))) {
      throw new BadRequestException({
        code: ErrorCodes.WRONG_OLD_PASSWORD,
        message: 'Old password not match.',
      });
    }

    return this.thirdPartyService.findAndUpdate(bindDto.tid, bindDto.source, { uid: user.id });
  }
}
