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

import { ErrorCodes } from './constants';
import { CreateNamespaceDto } from './dto/create-namespace.dto';
import { ListNamespaceQuery } from './dto/list-namespace.dto';
import { UpdateNamespaceDto } from './dto/update-namespace.dto';
import { Namespace, NamespaceDocument } from './entities/namespace.entity';
import { NamespaceService } from './namespace.service';

@ApiTags('namespace')
@ApiBearerAuth()
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
    const { ns } = createDto;

    if (ns) {
      const parent = await this.namespaceService.getByKey(ns);
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
  async list(
    @Query() query: ListNamespaceQuery,
    @Res() res: Response
  ): Promise<NamespaceDocument[]> {
    const count = await this.namespaceService.count(query);
    const data = await this.namespaceService.list(query);
    res.set({ 'X-Total-Count': count.toString() }).json(data);
    return data;
  }

  /**
   * Find namespace by id or key
   */
  @ApiOperation({ operationId: 'getNamespace' })
  @ApiOkResponse({
    description: 'The namespace with expected id or key.',
    type: Namespace,
  })
  @ApiParam({
    name: 'namespaceIdOrKey',
    type: 'string',
    description: 'Namespace id or key, if key should encodeURIComponent',
  })
  @Get(':namespaceIdOrKey')
  async get(@Param('namespaceIdOrKey') namespaceIdOrKey: string): Promise<NamespaceDocument> {
    const namespace = await this.namespaceService.get(namespaceIdOrKey);
    if (!namespace) {
      throw new NotFoundException({
        code: ErrorCodes.NAMESPACE_NOT_FOUND,
        message: `Namespace ${namespaceIdOrKey} not found.`,
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
  @Patch(':namespaceId')
  async update(
    @Param('namespaceId') namespaceId: string,
    @Body() updateDto: UpdateNamespaceDto
  ): Promise<NamespaceDocument> {
    const namespace = await this.namespaceService.update(namespaceId, updateDto);
    if (!namespace) {
      throw new NotFoundException({
        code: ErrorCodes.NAMESPACE_NOT_FOUND,
        message: `Namespace ${namespaceId} not found.`,
      });
    }
    return namespace;
  }

  /**
   * Delete namespace
   * Role required: NS_MANAGER
   */
  @ApiOperation({ operationId: 'deleteNamespace' })
  @ApiNoContentResponse({ description: 'No content.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':namespaceId')
  async delete(@Param('namespaceId') namespaceId: string): Promise<void> {
    await this.namespaceService.delete(namespaceId);
  }
}
