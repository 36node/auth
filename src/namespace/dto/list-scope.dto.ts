import { OmitType } from '@nestjs/swagger';

import { ListNamespaceQuery } from './list-namespace.dto';

export class ListScopeQuery extends OmitType(ListNamespaceQuery, ['parent_scope']) {}
