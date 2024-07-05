import {
  BadRequestException,
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
  Res,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

import { NamespaceService, ErrorCodes as NsErrCodes } from 'src/namespace';

import { ErrorCodes } from './constants';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUserQuery } from './dto/list-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';
import { UserService } from './user.service';
import { verifyIdentity } from './verify-identity';

@ApiTags('user')
@Controller('users')
// @UseInterceptors(MongooseClassSerializerInterceptor(User))
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly namespaceService: NamespaceService
  ) {}

  /**
   * Create user
   */
  @ApiOperation({ operationId: 'createUser' })
  @ApiCreatedResponse({
    description: 'The user has been successfully created.',
    type: User,
  })
  @Post()
  async create(@Body() createDto: CreateUserDto): Promise<UserDocument> {
    const { ns } = createDto;
    // 查询用户的 ns 是否存在
    const namespace = await this.namespaceService.getByKey(ns);
    if (!namespace) {
      throw new NotFoundException({
        code: NsErrCodes.NAMESPACE_NOT_FOUND,
        message: `Namespace ${ns} not found.`,
        details: [
          {
            message: `Namespace ${ns} not found.`,
            field: 'ns',
          },
        ],
      });
    }

    return this.userService.create(createDto);
  }

  /**
   * List users
   */
  @ApiOperation({ operationId: 'listUsers' })
  @ApiOkResponse({
    description: 'A paged array of users.',
    type: [User],
  })
  @Get()
  async list(@Query() query: ListUserQuery, @Res() res: Response): Promise<UserDocument[]> {
    const count = await this.userService.count(query);
    const data = await this.userService.list(query);
    res.set({ 'X-Total-Count': count.toString() }).json(data);
    return data;
  }

  /**
   * Find user
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
  async get(@Param('userId') userId: string): Promise<UserDocument> {
    const user = await this.userService.get(userId);
    if (!user) {
      throw new NotFoundException({
        code: ErrorCodes.USER_NOT_FOUND,
        message: `User ${userId} not found.`,
      });
    }
    return user;
  }

  /**
   * Update user
   */
  @ApiOperation({ operationId: 'updateUser' })
  @ApiOkResponse({
    description: 'The user updated.',
    type: User,
  })
  @Patch(':userId')
  async update(
    @Param('userId') userId: string,
    @Body() updateDto: UpdateUserDto
  ): Promise<UserDocument> {
    const { ns } = updateDto;
    if (ns) {
      const namespace = await this.namespaceService.getByKey(ns);
      if (!namespace) {
        throw new NotFoundException({
          code: NsErrCodes.NAMESPACE_NOT_FOUND,
          message: `Namespace ${ns} not found.`,
          details: [
            {
              message: `Namespace ${ns} not found.`,
              field: 'ns',
            },
          ],
        });
      }
    }

    return this.userService.update(userId, updateDto);
  }

  /**
   * Delete user
   */
  @ApiOperation({ operationId: 'deleteUser' })
  @ApiNoContentResponse({ description: 'No content.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':userId')
  async delete(@Param('userId') userId: string): Promise<void> {
    await this.userService.delete(userId);
  }

  /**
   * Verify identity
   */
  @ApiOperation({ operationId: 'verifyIdentity' })
  @ApiOkResponse({
    description: 'The user has been verified.',
    type: User,
  })
  @HttpCode(HttpStatus.OK)
  @Post(':userId/@verifyIdentity')
  async verifyIdentity(@Param('userId') userId: string): Promise<UserDocument> {
    const user = await this.userService.get(userId);
    if (!user) {
      throw new NotFoundException({
        code: ErrorCodes.USER_NOT_FOUND,
        message: `User ${userId} not found.`,
      });
    }
    const isVerified = await verifyIdentity(user.name, user.identity);
    if (isVerified) {
      user.identityVerified = true;
      user.identityVerifiedAt = new Date();
    } else {
      user.identityVerified = false;
    }

    return user.save();
  }

  /**
   * Reset password
   */
  @ApiOperation({ operationId: 'resetPassword' })
  @ApiNoContentResponse({ description: 'No content.', status: 200 })
  @HttpCode(HttpStatus.OK)
  @Post(':userId/@resetPassword')
  async resetPassword(
    @Param('userId') userId: string,
    @Body() dto: ResetPasswordDto
  ): Promise<void> {
    const user = await this.userService.updatePassword(userId, dto.password);
    if (!user) {
      throw new NotFoundException({
        code: ErrorCodes.USER_NOT_FOUND,
        message: `User ${userId} not found.`,
      });
    }
  }

  /**
   * Update password
   */
  @ApiOperation({ operationId: 'updatePassword' })
  @ApiNoContentResponse({ description: 'No content.', status: 200 })
  @HttpCode(HttpStatus.OK)
  @Post(':userId/@updatePassword')
  async updatePassword(
    @Param('userId') userId: string,
    @Body() dto: UpdatePasswordDto
  ): Promise<void> {
    const user = await this.userService.get(userId);
    if (!user) {
      throw new NotFoundException({
        code: ErrorCodes.USER_NOT_FOUND,
        message: `User ${userId} not found.`,
      });
    }

    if (!this.userService.checkPassword(user.password, dto.oldPassword)) {
      throw new BadRequestException({
        code: ErrorCodes.WRONG_OLD_PASSWORD,
        message: 'Old password not match.',
      });
    }

    await this.userService.updatePassword(userId, dto.newPassword);
  }
}
