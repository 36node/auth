import { CacheTTL } from '@nestjs/cache-manager';
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
  UseInterceptors,
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

import { CountResult, SetCacheInterceptor, UnsetCacheInterceptor } from 'src/common';
import { ErrorCodes } from 'src/constants';

import { CreateNamespaceDto } from './dto/create-namespace.dto';
import { ListNamespacesQuery } from './dto/list-namespaces.dto';
import { UpdateNamespaceDto } from './dto/update-namespace.dto';
import { Namespace, NamespaceDocument } from './entities/namespace.entity';
import { NamespaceService } from './namespace.service';

@ApiTags('namespace')
@ApiSecurity('ApiKey')
@Controller('namespaces')
export class NamespaceController {
  constructor(private readonly namespaceService: NamespaceService) {}

  /**
   * Create namespace
   */
  @ApiOperation({ operationId: 'createNamespace' })
  @ApiCreatedResponse({
    description: 'The namespace has been successfully created.',
    type: Namespace,
  })
  @Post()
  async create(@Body() createDto: CreateNamespaceDto): Promise<NamespaceDocument> {
    const { key, ns } = createDto;

    if (key) {
      const namespace = await this.namespaceService.get(key);
      if (namespace) {
        throw new ConflictException({
          code: ErrorCodes.NAMESPACE_ALREADY_EXISTS,
          message: `Namespace key ${key} exists.`,
          details: [
            {
              message: `Namespace key ${key} exists.`,
              field: 'key',
            },
          ],
        });
      }
    }

    if (ns) {
      const parent = await this.namespaceService.get(ns);
      if (!parent) {
        throw new NotFoundException({
          code: ErrorCodes.NAMESPACE_NOT_FOUND,
          message: `Parent namespace ${ns} not found.`,
          details: [
            {
              message: `Parent namespace ${ns} not found.`,
              field: 'ns',
            },
          ],
        });
      }
    }

    return this.namespaceService.create(createDto);
  }

  /**
   * List namespaces
   */
  @ApiOperation({ operationId: 'listNamespaces' })
  @ApiOkResponse({
    description: 'A paged array of namespaces.',
    type: [Namespace],
  })
  @Get()
  list(@Query() query: ListNamespacesQuery): Promise<NamespaceDocument[]> {
    return this.namespaceService.list(query);
  }

  /**
   * Count namespaces
   */
  @ApiOperation({ operationId: 'countNamespaces' })
  @ApiOkResponse({
    description: 'The result of count namespaces.',
    type: CountResult,
  })
  @Post('@count')
  async count(@Query() query: ListNamespacesQuery): Promise<CountResult> {
    const count = await this.namespaceService.count(query);
    return { count };
  }

  /**
   * Find namespace by key
   */
  @ApiOperation({ operationId: 'getNamespace' })
  @ApiOkResponse({
    description: 'The namespace with expected key.',
    type: Namespace,
  })
  @ApiParam({
    name: 'key',
    type: 'string',
    description: 'Namespace key, key should encodeURIComponent',
  })
  @UseInterceptors(SetCacheInterceptor)
  @CacheTTL(24 * 3600)
  @Get(':key')
  async get(@Param('key') key: string): Promise<NamespaceDocument> {
    const namespace = await this.namespaceService.get(key);
    if (!namespace) {
      throw new NotFoundException({
        code: ErrorCodes.NAMESPACE_NOT_FOUND,
        message: `Namespace ${key} not found.`,
      });
    }
    return namespace;
  }

  /**
   * Update namespace
   */
  @ApiOperation({ operationId: 'updateNamespace' })
  @ApiOkResponse({
    description: 'The namespace updated.',
    type: Namespace,
  })
  @UseInterceptors(UnsetCacheInterceptor)
  @Patch(':key')
  async update(
    @Param('key') key: string,
    @Body() updateDto: UpdateNamespaceDto
  ): Promise<NamespaceDocument> {
    const namespace = await this.namespaceService.update(key, updateDto);
    if (!namespace) {
      throw new NotFoundException({
        code: ErrorCodes.NAMESPACE_NOT_FOUND,
        message: `Namespace ${key} not found.`,
      });
    }
    return namespace;
  }

  /**
   * Delete namespace
   */
  @ApiOperation({ operationId: 'deleteNamespace' })
  @ApiNoContentResponse({ description: 'No content.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseInterceptors(UnsetCacheInterceptor)
  @Delete(':key')
  async delete(@Param('key') key: string): Promise<void> {
    await this.namespaceService.delete(key);
  }
}
