import { CacheKey } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Body,
  CacheTTL,
  ConflictException,
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
  Res,
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
import { Response } from 'express';
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
    const { username, employeeId, email, phone, ns } = createDto;

    if (username) {
      const user = await this.userService.findByUsername(username);
      if (user) {
        throw new ConflictException({
          code: ErrorCodes.USER_ALREADY_EXISTS,
          message: `Username ${username} already exists.`,
          details: [
            {
              message: `Username ${username} already exists.`,
              field: 'username',
            },
          ],
        });
      }
    }

    if (employeeId) {
      const user = await this.userService.findByEmployeeId(employeeId);
      if (user) {
        throw new ConflictException({
          code: ErrorCodes.EMPLOYEE_ID_ALREADY_EXISTS,
          message: `EmployeeId ${employeeId} already exists.`,
          details: [
            {
              message: `EmployeeId ${employeeId} already exists.`,
              field: 'employeeId',
            },
          ],
        });
      }
    }

    if (email) {
      const user = await this.userService.findByEmail(email);
      if (user) {
        throw new ConflictException({
          code: ErrorCodes.EMAIL_ALREADY_EXISTS,
          message: `Email ${email} already exists.`,
          details: [
            {
              message: `Email ${email} already exists.`,
              field: 'email',
            },
          ],
        });
      }
    }

    if (phone) {
      const user = await this.userService.findByPhone(phone);
      if (user) {
        throw new ConflictException({
          code: ErrorCodes.PHONE_ALREADY_EXISTS,
          message: `Phone ${phone} already exists.`,
          details: [
            {
              message: `Phone ${phone} already exists.`,
              field: 'phone',
            },
          ],
        });
      }
    }

    // 查询用户的 ns 是否存在
    if (ns) {
      const namespace = await this.namespaceService.getByKey(ns);
      if (!namespace) {
        throw new NotFoundException({
          code: ErrorCodes.NAMESPACE_NOT_FOUND,
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
  async list(@Query() query: ListUsersQuery, @Res() res: Response): Promise<UserDocument[]> {
    const count = await this.userService.count(query);
    const data = await this.userService.list(query);
    res.set({ 'X-Total-Count': count.toString() }).json(data);

    return data;
  }

  /**
   * Count users
   */
  @ApiOperation({ operationId: 'countUsers' })
  @ApiOkResponse({
    description: 'The result of count users.',
    type: [CountResult],
  })
  @Post('@countUsers')
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
    const { username, email, phone, employeeId, ns } = updateDto;
    if (ns) {
      const namespace = await this.namespaceService.getByKey(ns);
      if (!namespace) {
        throw new NotFoundException({
          code: ErrorCodes.NAMESPACE_NOT_FOUND,
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

    const user = await this.userService.get(userId);

    if (username) {
      const exists = await this.userService.findByUsername(username);
      if (exists && exists.id !== user?.id) {
        throw new ConflictException({
          code: ErrorCodes.USER_ALREADY_EXISTS,
          message: `Username ${username} already exists.`,
          details: [
            {
              message: `Username ${username} already exists.`,
              field: 'username',
            },
          ],
        });
      }
    }

    if (employeeId) {
      const exists = await this.userService.findByEmployeeId(employeeId);
      if (exists && exists.id !== user?.id) {
        throw new ConflictException({
          code: ErrorCodes.EMPLOYEE_ID_ALREADY_EXISTS,
          message: `EmployeeId ${employeeId} already exists.`,
          details: [
            {
              message: `EmployeeId ${employeeId} already exists.`,
              field: 'employeeId',
            },
          ],
        });
      }
    }

    if (email) {
      const exists = await this.userService.findByEmail(email);
      if (exists && exists.id !== user?.id) {
        throw new ConflictException({
          code: ErrorCodes.EMAIL_ALREADY_EXISTS,
          message: `Email ${email} already exists.`,
          details: [
            {
              message: `Email ${email} already exists.`,
              field: 'email',
            },
          ],
        });
      }
    }

    if (phone) {
      const exists = await this.userService.findByPhone(phone);
      if (exists && exists.id !== user?.id) {
        throw new ConflictException({
          code: ErrorCodes.PHONE_ALREADY_EXISTS,
          message: `Phone ${phone} already exists.`,
          details: [
            {
              message: `Phone ${phone} already exists.`,
              field: 'phone',
            },
          ],
        });
      }
    }

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
    const { username, email, phone, ns, employeeId: toBeUpdatedEmployeeId } = dto;
    if (ns) {
      const namespace = await this.namespaceService.getByKey(ns);
      if (!namespace) {
        throw new NotFoundException({
          code: ErrorCodes.NAMESPACE_NOT_FOUND,
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

    const user = await this.userService.findByEmployeeId(employeeId);

    if (username) {
      const exists = await this.userService.findByUsername(username);
      if (exists && exists.id !== user?.id) {
        throw new ConflictException({
          code: ErrorCodes.USER_ALREADY_EXISTS,
          message: `Username ${username} already exists.`,
          details: [
            {
              message: `Username ${username} already exists.`,
              field: 'username',
            },
          ],
        });
      }
    }

    if (toBeUpdatedEmployeeId && toBeUpdatedEmployeeId !== employeeId) {
      const exists = await this.userService.findByEmployeeId(toBeUpdatedEmployeeId);
      if (exists && exists.id !== user?.id) {
        throw new ConflictException({
          code: ErrorCodes.EMPLOYEE_ID_ALREADY_EXISTS,
          message: `EmployeeId ${employeeId} already exists.`,
          details: [
            {
              message: `EmployeeId ${employeeId} already exists.`,
              field: 'employeeId',
            },
          ],
        });
      }
    }

    if (email) {
      const exists = await this.userService.findByEmail(email);
      if (exists && exists.id !== user?.id) {
        throw new ConflictException({
          code: ErrorCodes.EMAIL_ALREADY_EXISTS,
          message: `Email ${email} already exists.`,
          details: [
            {
              message: `Email ${email} already exists.`,
              field: 'email',
            },
          ],
        });
      }
    }

    if (phone) {
      const exists = await this.userService.findByPhone(phone);
      if (exists && exists.id !== user?.id) {
        throw new ConflictException({
          code: ErrorCodes.PHONE_ALREADY_EXISTS,
          message: `Phone ${phone} already exists.`,
          details: [
            {
              message: `Phone ${phone} already exists.`,
              field: 'phone',
            },
          ],
        });
      }
    }

    return this.userService.upsertByEmployee(employeeId, dto);
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
    // TODO: 从返回的数据库错误中，解析数据冲突的字段
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
    return this.userService.upsertByPhone(phone, dto);
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

    if (user.password && !this.userService.checkPassword(user.password, dto.oldPassword)) {
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
