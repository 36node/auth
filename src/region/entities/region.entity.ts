import { ApiProperty } from '@nestjs/swagger';

export class Region {
  /**
   * 缩写
   */
  @ApiProperty({ type: String })
  code: string;
  /**
   * 中文名称
   */
  @ApiProperty({ type: String })
  nameZh: string;
  /**
   * 中文拼音
   */
  @ApiProperty({ type: String })
  namePinyin: string;
  /**
   * 英文名称
   */
  @ApiProperty({ type: String })
  nameEn: string;
  /**
   * 电话前缀
   */
  @ApiProperty({ type: String })
  dialingPrefix: string;
}
