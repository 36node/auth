import { OmitType } from '@nestjs/swagger';

import { CreateNamespaceDto } from './create-namespace.dto';

export class UpsertNamespaceDto extends OmitType(CreateNamespaceDto, ['key'] as const) {}
