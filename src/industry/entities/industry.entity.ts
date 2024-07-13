import { ApiProperty } from '@nestjs/swagger';

export class Industry {
  /**
   * 编码
   */
  @ApiProperty({ type: String })
  code: string;

  /**
   * 名称
   */
  @ApiProperty({ type: String })
  name: string;

  /**
   * 子集
   */
  @ApiProperty({ type: [Industry] })
  children: Industry[];
}
