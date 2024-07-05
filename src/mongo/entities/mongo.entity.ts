import { Prop } from '@nestjs/mongoose';

export class MongoEntity {
  /**
   * Entity id
   */
  id: string;

  /**
   * Entity created at when
   */
  createdAt?: Date;

  /**
   * Entity updated at when
   */
  updatedAt?: Date;

  /**
   * Entity created by who
   */
  createdBy?: string;

  /**
   * Entity updated by who
   */
  updatedBy?: string;
}

export class MongoBaseDoc {
  /**
   * Entity created by who
   */
  @Prop()
  createdBy?: string;

  /**
   * Entity updated by who
   */
  @Prop()
  updatedBy?: string;
}
