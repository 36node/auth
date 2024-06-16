import { Prop } from '@nestjs/mongoose';

export class MongoEntity {
  /**
   * Entity id
   */
  id: string;

  /**
   * Entity created at when
   */
  createAt?: Date;

  /**
   * Entity updated at when
   */
  updateAt?: Date;

  /**
   * Entity created by who
   */
  createBy?: string;

  /**
   * Entity updated by who
   */
  updateBy?: string;
}

export class MongoBaseDoc {
  /**
   * Entity created by who
   */
  @Prop()
  createBy?: string;

  /**
   * Entity updated by who
   */
  @Prop()
  updateBy?: string;
}
