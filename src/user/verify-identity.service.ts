import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import lodash from 'lodash';

import { errCodes } from 'src/common';
import { settings } from 'src/config';

@Injectable()
export class VerifyIdentityService {
  async verify(name: string, identity: string) {
    if (settings.identityVerify.fake === true) {
      const { fakeName, fakeIdentity } = settings.identityVerify;
      if (fakeName === name && fakeIdentity === identity) {
        return true;
      }

      return false;
    }

    try {
      const response = await axios.get('http://id2meta.market.alicloudapi.com/id2meta', {
        params: {
          userName: name,
          identifyNum: identity,
        },
        headers: {
          Authorization: `APPCODE ${settings.identityVerify.appCode}`,
        },
      });

      if (lodash.get(response.data, 'code') === '200') {
        return lodash.get(response.data, 'data.bizCode') === '1';
      }

      throw new InternalServerErrorException({
        code: errCodes.INTERNAL_ERROR,
        message: `Internal server error`,
      });
    } catch (error) {
      throw new InternalServerErrorException({
        code: errCodes.INTERNAL_ERROR,
        message: `Internal server error`,
      });
    }
  }
}
