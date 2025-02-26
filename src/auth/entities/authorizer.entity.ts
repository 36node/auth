import { IsNotEmpty, IsString } from 'class-validator';

export class Authorizer {
  /**
   * url
   */
  @IsNotEmpty()
  @IsString()
  url: string;
}
