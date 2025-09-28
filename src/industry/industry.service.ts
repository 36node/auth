import { Injectable } from '@nestjs/common';
import { isInteger } from 'lodash';

import { industries } from './data';
import { ListIndustriesQuery } from './dto/list-industries.dto';

const prune = (industries, depth) => {
  return industries.map((industry) => {
    const { children, ...rest } = industry;
    if (depth === 1) {
      return rest;
    }
    return {
      ...rest,
      children: prune(children, depth - 1),
    };
  });
};

@Injectable()
export class IndustryService {
  list(query: ListIndustriesQuery = {}) {
    const { depth } = query;
    if (!depth || !isInteger(depth) || depth < 1) {
      return industries;
    }
    return prune(industries, depth);
  }
}
