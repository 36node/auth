import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class TimeRange {
  /**
   * 标题
   */
  @Prop()
  title?: string;

  /**
   * 开始
   */
  @Prop()
  start: string;

  /**
   * 结束
   */
  @Prop()
  end: string;

  /**
   * 描述
   */
  @Prop()
  desc?: string;
}
