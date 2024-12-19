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

import { CreateRoleDto } from './dto/create-role.dto';
import { ListRolesQuery } from './dto/list-roles.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role, RoleDocument } from './entities/role.entity';
import { RoleService } from './role.service';

@ApiTags('role')
@ApiBearerAuth()
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  /**
   * Create role
   */
  @ApiOperation({ operationId: 'createRole' })
  @ApiCreatedResponse({
    description: 'The role has been successfully created.',
    type: Role,
  })
  @Post()
  async create(@Body() createDto: CreateRoleDto): Promise<RoleDocument> {
    const { key } = createDto;

    const role = await this.roleService.getByKey(key);
    if (role) {
      throw new ConflictException({
        code: ErrorCodes.ROLE_ALREADY_EXISTS,
        message: `Role ${key} already exists.`,
      });
    }

    return this.roleService.create(createDto);
  }

  /**
   * List roles
   */
  @ApiOperation({ operationId: 'listRoles' })
  @ApiOkResponse({
    description: 'A paged array of roles.',
    type: [Role],
  })
  @Get()
  async list(@Query() query: ListRolesQuery, @Res() res: Response): Promise<RoleDocument[]> {
    const count = await this.roleService.count(query);
    const data = await this.roleService.list(query);
    res.set({ 'X-Total-Count': count.toString() }).json(data);
    return data;
  }

  /**
   * Find role by id or key
   */
  @ApiOperation({ operationId: 'getRole' })
  @ApiOkResponse({
    description: 'The role with expected id or key.',
    type: Role,
  })
  @ApiParam({
    name: 'roleIdOrKey',
    type: 'string',
    description: 'Role id or key',
  })
  @Get(':roleIdOrKey')
  async get(@Param('roleIdOrKey') roleIdOrKey: string): Promise<RoleDocument> {
    const role = await this.roleService.get(roleIdOrKey);
    if (!role) {
      throw new NotFoundException({
        code: ErrorCodes.ROLE_NOT_FOUND,
        message: `Role ${roleIdOrKey} not found.`,
      });
    }
    return role;
  }

  /**
   * Update role
   */
  @ApiOperation({ operationId: 'updateRole' })
  @ApiOkResponse({
    description: 'The role updated.',
    type: Role,
  })
  @Patch(':roleId')
  async update(
    @Param('roleId') roleId: string,
    @Body() updateDto: UpdateRoleDto
  ): Promise<RoleDocument> {
    const role = await this.roleService.update(roleId, updateDto);
    if (!role) {
      throw new NotFoundException({
        code: ErrorCodes.ROLE_ALREADY_EXISTS,
        message: `Role ${roleId} not found.`,
      });
    }
    return role;
  }

  /**
   * Delete role
   */
  @ApiOperation({ operationId: 'deleteRole' })
  @ApiNoContentResponse({ description: 'No content.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':roleId')
  async delete(@Param('roleId') roleId: string): Promise<void> {
    await this.roleService.delete(roleId);
  }
}
