import { OmitType } from '@nestjs/swagger';

import { NamespaceDoc } from '../entities/namespace.entity';

export class CreateNamespaceDto extends OmitType(NamespaceDoc, ['isScope', 'ns'] as const) {}
