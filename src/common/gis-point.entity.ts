import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class GisPoint {
  /**
   * Latitude 纬度
   */
  @Prop()
  lat: number;

  /**
   * Longitude 经度
   */
  @Prop()
  lng: number;
}
