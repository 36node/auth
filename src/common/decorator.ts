import { ApiProperty } from '@nestjs/swagger';

export function ApiStringOrArray(description: string, required: boolean = false) {
  return ApiProperty({
    type: undefined,
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    description,
    required,
  });
}
