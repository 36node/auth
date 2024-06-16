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

import { CreateNamespaceDto } from './dto/create-namespace.dto';
import { ListNamespaceQuery } from './dto/list-namespace.dto';
import { ListScopeQuery } from './dto/list-scope.dto';
import { UpdateNamespaceDto } from './dto/update-namespace.dto';
import { Namespace } from './entities/namespace.entity';
import { NamespaceService } from './namespace.service';

@ApiTags('namespace')
@ApiBearerAuth()
@Controller()
export class NamespaceController {
  constructor(private readonly namespaceService: NamespaceService) {}

  /**
   * Create namespace
   * Role required: NS_MANAGER
   */
  @ApiOperation({ operationId: 'createNamespace' })
  @ApiCreatedResponse({
    description: 'The namespace has been successfully created.',
    type: Namespace,
  })
  @Post('namespaces')
  async create(@Body() createDto: CreateNamespaceDto) {
    const { parent } = createDto;
    if (parent) {
      const parentNs = await this.namespaceService.getByFullPath(parent);
      if (!parentNs) {
        throw new NotFoundException({
          code: errCodes.NAMESPACE_NOT_FOUND,
          message: `Namespace ${parent} not found.`,
          details: [
            {
              message: `Namespace ${parent} not found.`,
              field: 'parent',
            },
          ],
        });
      }
    }
    return await this.namespaceService.create(createDto);
  }

  /**
   * List namespaces
   * Role required: NS_MANAGER
   */
  @ApiOperation({ operationId: 'listNamespaces' })
  @ApiOkResponse({
    description: 'A paged array of namespaces.',
    type: [Namespace],
  })
  @Get('namespaces')
  async list(@Req() req: Request, @Query() query: ListNamespaceQuery, @Res() res: Response) {
    const count = await this.namespaceService.count(query);
    const data = await this.namespaceService.list(query);
    res.set({ 'X-Total-Count': count.toString() }).json(data);
    return data;
  }

  /**
   * Find namespace by
   * Role required: NS_MANAGER
   */
  @ApiOperation({ operationId: 'getNamespace' })
  @ApiOkResponse({
    description: 'The namespace with expected id or ns.',
    type: Namespace,
  })
  @ApiParam({
    name: 'namespaceIdOrNs',
    type: 'string',
    description: 'Namespace id or ns, should encodeURIComponent',
  })
  @Get('namespaces/:namespaceIdOrNs')
  async get(@Req() request: Request) {
    return get(request, 'state.namespace');
  }

  /**
   * Update namespace
   * Role required: NS_MANAGER
   */
  @ApiOperation({ operationId: 'updateNamespace' })
  @ApiOkResponse({
    description: 'The namespace updated.',
    type: Namespace,
  })
  @Patch('namespaces/:namespaceId')
  async update(@Param('namespaceId') namespaceId: string, @Body() updateDto: UpdateNamespaceDto) {
    return await this.namespaceService.update(namespaceId, updateDto);
  }

  /**
   * Delete namespace
   * Role required: NS_MANAGER
   */
  @ApiOperation({ operationId: 'deleteNamespace' })
  @ApiNoContentResponse({ description: 'No content.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('namespaces/:namespaceId')
  async delete(@Param('namespaceId') namespaceId: string) {
    await this.namespaceService.delete(namespaceId);
  }

  /**
   * List namespaces scopes
   * Role required: AUTH_MANAGER
   */
  @ApiOperation({ operationId: 'listScopes' })
  @ApiOkResponse({
    description: 'A paged array of namespace scopes.',
    type: [Namespace],
  })
  @Get('scopes')
  async listScopes(@Query() query: ListScopeQuery, @Res() res: Response) {
    const count = await this.namespaceService.count({ ...query, parent: null });
    const data = await this.namespaceService.list({ ...query, parent: null });
    res.set({ 'X-Total-Count': count.toString() }).json(data);
    return data;
  }
}
