import { OmitType, PartialType } from '@nestjs/swagger';

import { CreateNamespaceDto } from './create-namespace.dto';

/**
 * Update namespace
 *
 * 不允许修改 namespace 的 key, parent 字段
 * 只能建立一个新的 namespace
 */

export class UpdateNamespaceDto extends PartialType(
  OmitType(CreateNamespaceDto, ['key', 'parent'])
) {}
