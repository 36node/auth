import { PartialType, PickType } from '@nestjs/swagger';

import { UserDoc } from 'src/user/entities/user.entity';

export class UpdateMyInfoDto extends PartialType(
  PickType(UserDoc, ['avatar', 'registerRegion', 'language', 'nickname', 'username', 'intro'])
) {}
