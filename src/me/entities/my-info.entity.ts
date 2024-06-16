import { IsBoolean, IsNotEmpty } from 'class-validator';

import { User } from 'src/user';

export class MyInfo extends User {
  /**
   * 是否有密码
   */
  @IsNotEmpty()
  @IsBoolean()
  hasPassword: boolean;
}
