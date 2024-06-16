import { Injectable } from '@nestjs/common';

import { regionList } from 'src/common';

@Injectable()
export class BaseDataService {
  listRegions() {
    return regionList;
  }
}
