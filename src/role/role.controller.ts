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

import { CountResult } from 'src/common/entities/count.entity';
import { ErrorCodes } from 'src/constants';

import { CreateRoleDto } from './dto/create-role.dto';
import { ListRolesQuery } from './dto/list-roles.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role, RoleDocument } from './entities/role.entity';
import { RoleService } from './role.service';

@ApiTags('role')
@ApiSecurity('ApiKey')
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
  list(@Query() query: ListRolesQuery): Promise<RoleDocument[]> {
    return this.roleService.list(query);
  }

  /**
   * Count roles
   */
  @ApiOperation({ operationId: 'countRoles' })
  @ApiOkResponse({
    description: 'The result of count roles.',
    type: CountResult,
  })
  @Post('@count')
  async count(@Query() query: ListRolesQuery): Promise<CountResult> {
    const count = await this.roleService.count(query);
    return { count };
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
