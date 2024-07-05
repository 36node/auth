import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class OssFile {
  /**
   * 描述
   */
  @Prop()
  desc?: string;

  /**
   * 图片名称
   */
  @Prop()
  name?: string;

  /**
   * 地址, 例如
   *
   * `https://oss.aliyun.com/uploads/2020/01/01/xxx.jpg`
   */
  @Prop()
  url: string;
}
