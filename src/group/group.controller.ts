import {
  Body,
  ConflictException,
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
import { Response } from 'express';

import { ErrorCodes } from 'src/constants';
import { NamespaceService } from 'src/namespace';

import { CreateGroupDto } from './dto/create-group.dto';
import { ListGroupsQuery } from './dto/list-groups.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group, GroupDocument } from './entities/group.entity';
import { GroupService } from './group.service';

@ApiTags('group')
@ApiBearerAuth()
@Controller('groups')
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly namespaceService: NamespaceService
  ) {}

  /**
   * Create group
   */
  @ApiOperation({ operationId: 'createGroup' })
  @ApiCreatedResponse({
    description: 'The group has been successfully created.',
    type: Group,
  })
  @Post()
  async create(@Body() createDto: CreateGroupDto): Promise<GroupDocument> {
    const { name } = createDto;

    const group = await this.groupService.getByName(name);
    if (group) {
      throw new ConflictException({
        code: ErrorCodes.GROUP_ALREADY_EXISTS,
        message: `Group ${name} already exists.`,
      });
    }

    return this.groupService.create(createDto);
  }

  /**
   * List groups
   */
  @ApiOperation({ operationId: 'listGroups' })
  @ApiOkResponse({
    description: 'A paged array of groups.',
    type: [Group],
  })
  @Get()
  async list(@Query() query: ListGroupsQuery, @Res() res: Response): Promise<GroupDocument[]> {
    const count = await this.groupService.count(query);
    const data = await this.groupService.list(query);
    res.set({ 'X-Total-Count': count.toString() }).json(data);
    return data;
  }

  /**
   * Find group by id or name
   */
  @ApiOperation({ operationId: 'getGroup' })
  @ApiOkResponse({
    description: 'The group with expected id or name.',
    type: Group,
  })
  @ApiParam({
    name: 'groupIdOrName',
    type: 'string',
    description: 'Group id or name, if name should encodeURIComponent',
  })
  @Get(':groupIdOrName')
  async get(@Param('groupIdOrName') groupIdOrName: string): Promise<GroupDocument> {
    const group = await this.groupService.get(groupIdOrName);
    if (!group) {
      throw new NotFoundException({
        code: ErrorCodes.GROUP_NOT_FOUND,
        message: `Group ${groupIdOrName} not found.`,
      });
    }
    return group;
  }

  /**
   * Update group
   */
  @ApiOperation({ operationId: 'updateGroup' })
  @ApiOkResponse({
    description: 'The group updated.',
    type: Group,
  })
  @Patch(':groupId')
  async update(
    @Param('groupId') groupId: string,
    @Body() updateDto: UpdateGroupDto
  ): Promise<GroupDocument> {
    const group = await this.groupService.update(groupId, updateDto);
    if (!group) {
      throw new NotFoundException({
        code: ErrorCodes.GROUP_NOT_FOUND,
        message: `Group ${groupId} not found.`,
      });
    }
    return group;
  }

  /**
   * Delete group
   */
  @ApiOperation({ operationId: 'deleteGroup' })
  @ApiNoContentResponse({ description: 'No content.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':groupId')
  async delete(@Param('groupId') groupId: string): Promise<void> {
    await this.groupService.delete(groupId);
  }
}
