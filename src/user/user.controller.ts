import { CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RedisClientType } from 'redis';

import { CountResult, SetCacheInterceptor, UnsetCacheInterceptor } from 'src/common';
import { ErrorCodes } from 'src/constants';
import { NamespaceService } from 'src/namespace';

import { AggregateUserDto } from './dto/aggregate.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersQuery } from './dto/list-users.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserAggregateResult } from './entities/user.aggregate.entity';
import { User, UserDocument } from './entities/user.entity';
import { UserService } from './user.service';
import { verifyIdentity } from './verify-identity';

@ApiTags('user')
@Controller('users')
// @UseInterceptors(MongooseClassSerializerInterceptor(User))
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly namespaceService: NamespaceService,
    @Inject('REDIS_CLIENT') private readonly redis: RedisClientType
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
    await this.ensureNamespaceExists(createDto.ns);

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
  list(@Query() query: ListUsersQuery): Promise<UserDocument[]> {
    return this.userService.list(query);
  }

  /**
   * Count users
   */
  @ApiOperation({ operationId: 'countUsers' })
  @ApiOkResponse({
    description: 'The result of count users.',
    type: CountResult,
  })
  @Post('@count')
  async count(@Query() query: ListUsersQuery): Promise<CountResult> {
    const count = await this.userService.count(query);
    return { count };
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
  @UseInterceptors(SetCacheInterceptor)
  @CacheTTL(24 * 3600)
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
  @UseInterceptors(UnsetCacheInterceptor)
  @CacheKey('/users/:id')
  async update(
    @Param('userId') userId: string,
    @Body() updateDto: UpdateUserDto
  ): Promise<UserDocument> {
    await this.ensureNamespaceExists(updateDto.ns);

    return this.userService.update(userId, updateDto);
  }

  /**
   * Upsert user by employeeId
   */
  @ApiOperation({ operationId: 'upsertUserByEmployeeId' })
  @ApiOkResponse({
    description: 'The user upserted.',
    type: User,
  })
  @UseInterceptors(UnsetCacheInterceptor)
  @CacheKey('/users/:id')
  @Post(':employeeId/@upsertUserByEmployeeId')
  async upsertByEmployeeId(
    @Param('employeeId') employeeId: string,
    @Body() dto: CreateUserDto
  ): Promise<UserDocument> {
    await this.ensureNamespaceExists(dto.ns);

    return this.userService.upsertByEmployee(employeeId, dto);
  }

  /**
   * Upsert user by id
   */
  @ApiOperation({ operationId: 'upsertUserById' })
  @ApiOkResponse({
    description: 'The user upserted.',
    type: User,
  })
  @UseInterceptors(UnsetCacheInterceptor)
  @CacheKey('/users/:id')
  @Post(':userId/@upsertUserById')
  async upsertById(
    @Param('userId') userId: string,
    @Body() dto: CreateUserDto
  ): Promise<UserDocument> {
    await this.ensureNamespaceExists(dto.ns);

    return this.userService.upsertById(userId, { ...dto, id: userId });
  }

  /**
   * Upsert user by username
   */
  @ApiOperation({ operationId: 'upsertUserByUsername' })
  @ApiOkResponse({
    description: 'The user upserted.',
    type: User,
  })
  @UseInterceptors(UnsetCacheInterceptor)
  @CacheKey('/users/:id')
  @Post(':username/@upsertUserByUsername')
  async upsertByUsername(
    @Param('username') username: string,
    @Body() dto: CreateUserDto
  ): Promise<UserDocument> {
    await this.ensureNamespaceExists(dto.ns);

    return this.userService.upsertByUsername(username, dto);
  }

  /**
   * Upsert user by email
   */
  @ApiOperation({ operationId: 'upsertUserByEmail' })
  @ApiOkResponse({
    description: 'The user upserted.',
    type: User,
  })
  @UseInterceptors(UnsetCacheInterceptor)
  @CacheKey('/users/:id')
  @Post(':email/@upsertUserByEmail')
  async upsertByEmail(
    @Param('email') email: string,
    @Body() dto: CreateUserDto
  ): Promise<UserDocument> {
    await this.ensureNamespaceExists(dto.ns);

    return this.userService.upsertByEmail(email, dto);
  }

  /**
   * Upsert user by phone
   */
  @ApiOperation({ operationId: 'upsertUserByPhone' })
  @ApiOkResponse({
    description: 'The user upserted.',
    type: User,
  })
  @UseInterceptors(UnsetCacheInterceptor)
  @CacheKey('/users/:id')
  @Post(':phone/@upsertUserByPhone')
  async upsertByPhone(
    @Param('phone') phone: string,
    @Body() dto: CreateUserDto
  ): Promise<UserDocument> {
    await this.ensureNamespaceExists(dto.ns);

    return this.userService.upsertByPhone(phone, dto);
  }

  private async ensureNamespaceExists(ns?: string): Promise<void> {
    if (!ns) return;
    const namespace = await this.namespaceService.get(ns);
    if (!namespace) {
      throw new NotFoundException({
        code: ErrorCodes.NAMESPACE_NOT_FOUND,
        message: `Namespace ${ns} not found.`,
        keyValue: { ns },
      });
    }
  }

  /**
   * Delete user
   */
  @ApiOperation({ operationId: 'deleteUser' })
  @ApiNoContentResponse({ description: 'No content.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseInterceptors(UnsetCacheInterceptor)
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
  @UseInterceptors(UnsetCacheInterceptor)
  @CacheKey('/users/:id')
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
   * Update password
   */
  @ApiOperation({ operationId: 'updatePassword' })
  @HttpCode(HttpStatus.NO_CONTENT)
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

    if (dto.oldPassword && !this.userService.checkPassword(user.password, dto.oldPassword)) {
      throw new BadRequestException({
        code: ErrorCodes.WRONG_OLD_PASSWORD,
        message: 'Old password not match.',
      });
    }

    await this.userService.updatePassword(userId, dto.newPassword);
  }

  /**
   * Aggregate user
   */
  @ApiOperation({ operationId: 'aggregateUsers' })
  @ApiOkResponse({
    description: 'A paged array of user aggregate results.',
    type: [UserAggregateResult],
  })
  @Post('@aggregate')
  async aggregate(@Query() query: ListUsersQuery, @Body() body: AggregateUserDto) {
    return this.userService.aggregate(query, body);
  }
}
