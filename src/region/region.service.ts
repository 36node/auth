import { Injectable } from '@nestjs/common';

import { regionList } from './data';

@Injectable()
export class RegionService {
  listRegions() {
    return regionList;
  }
}
