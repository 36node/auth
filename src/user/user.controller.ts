import {
  BadRequestException,
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
import { ListUsersQuery } from './dto/list-users.dto';
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
    const { username, email, phone, employeeId, ns } = updateDto;
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
  @Patch('employee/:userEmployeeId')
  async upsert(
    @Param('userEmployeeId') userEmployeeId: string,
    @Body() updateDto: UpdateUserDto
  ): Promise<UserDocument> {
    const { username, email, phone, employeeId, ns } = updateDto;
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

    const user = await this.userService.findByEmployeeId(userEmployeeId);

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

    return this.userService.upsertByEmployeeId(userEmployeeId, updateDto);
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
  @HttpCode(HttpStatus.NO_CONTENT)
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
}
