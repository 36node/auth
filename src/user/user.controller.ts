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
import { get } from 'lodash';

import { errCodes } from 'src/common';
import { getScope } from 'src/lib/lang/string';
import { NamespaceService } from 'src/namespace';

import { CreateUserDto } from './dto/create-user.dto';
import { ListUserQuery } from './dto/list-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@ApiTags('user')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly namespaceService: NamespaceService
  ) {}

  /**
   * Create user
   * Role required: USER_MANAGER
   */
  @ApiOperation({ operationId: 'createUser' })
  @ApiCreatedResponse({
    description: 'The user has been successfully created.',
    type: User,
  })
  @Post()
  async create(@Body() createDto: CreateUserDto) {
    const { ns: userNs, password } = createDto;
    // 查询用户的 ns 是否存在
    const namespace = await this.namespaceService.getByFullPath(userNs);
    if (!namespace) {
      throw new NotFoundException({
        code: errCodes.NAMESPACE_NOT_FOUND,
        message: `Namespace ${userNs} not found.`,
        details: [
          {
            message: `Namespace ${userNs} not found.`,
            field: 'ns',
          },
        ],
      });
    }

    // 验证密码强度
    if (password) {
      const scope = await this.namespaceService.getByFullPath(getScope(userNs));
      this.namespaceService.passwordValidate(password, scope?.passwordRegExp);
    }

    return this.userService.create(createDto);
  }

  /**
   * List users
   * Role required: USER_MANAGER
   */
  @ApiOperation({ operationId: 'listUsers' })
  @ApiOkResponse({
    description: 'A paged array of users.',
    type: [User],
  })
  @Get()
  async list(@Query() query: ListUserQuery, @Res() res: Response) {
    const count = await this.userService.count(query);
    const data = await this.userService.list(query);
    res.set({ 'X-Total-Count': count.toString() }).json(data);
    return data;
  }

  /**
   * Find user
   * Role required: USER_MANAGER
   */
  @ApiOperation({ operationId: 'getUser' })
  @ApiOkResponse({
    description: 'The user with expected id.',
    type: User,
  })
  @ApiParam({
    name: 'userId',
    type: 'string',
    description: 'User id',
  })
  @Get(':userId')
  async get(@Req() request: Request) {
    return get(request, 'state.user');
  }

  /**
   * Update user
   * Role required: USER_MANAGER
   */
  @ApiOperation({ operationId: 'updateUser' })
  @ApiOkResponse({
    description: 'The user updated.',
    type: User,
  })
  @Patch(':userId')
  async update(
    @Req() request: Request,
    @Param('userId') userId: string,
    @Body() updateDto: UpdateUserDto
  ) {
    const { ns: updateNs, password } = updateDto;
    if (updateNs) {
      const namespace = await this.namespaceService.getByFullPath(updateNs);
      if (!namespace) {
        throw new NotFoundException({
          code: errCodes.NAMESPACE_NOT_FOUND,
          message: `Namespace ${updateNs} not found.`,
          details: [
            {
              message: `Namespace ${updateNs} not found.`,
              field: 'ns',
            },
          ],
        });
      }
    }

    // 验证密码强度
    if (password) {
      let checkScope: string;
      if (updateNs) {
        checkScope = getScope(updateNs);
      } else {
        checkScope = get(request, 'state.user.scope');
      }

      const scope = await this.namespaceService.getByFullPath(checkScope);
      this.namespaceService.passwordValidate(password, scope?.passwordRegExp);
    }

    const user = await this.userService.update(userId, updateDto);

    if (password) {
      user.password = password;
      await user.save();
    }

    return user;
  }

  /**
   * Delete user
   * Role required: USER_MANAGER
   */
  @ApiOperation({ operationId: 'deleteUser' })
  @ApiNoContentResponse({ description: 'No content.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':userId')
  async delete(@Param('userId') userId: string) {
    await this.userService.delete(userId);
  }
}
