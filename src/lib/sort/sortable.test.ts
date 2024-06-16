import { Prop, Schema } from '@nestjs/mongoose';

import { getSortableFields, getSortParams, SortFields, toSortParams } from './sortable';

@Schema()
@SortFields(['filed2', 'filed3'])
class SortTestDoc {
  @Prop()
  filed1: string;

  @Prop()
  filed2: string;

  @Prop()
  filed3: number;
}

describe('getSortableFields', () => {
  it('should return an array of sortable filed set in the metadata', () => {
    const sortableFields = getSortableFields(SortTestDoc);
    expect(sortableFields).toEqual(['filed2', 'filed3']);
  });
});

describe('toSortParams', () => {
  it('should return an array of fields with the sorting direction', () => {
    expect(toSortParams(['filed2', 'filed3'])).toEqual(['filed2', '-filed2', 'filed3', '-filed3']);
  });
});

describe('getSortParams', () => {
  it('should return sort params for schema', () => {
    expect(getSortParams(SortTestDoc)).toEqual([
      'createAt',
      '-createAt',
      'updateAt',
      '-updateAt',
      'filed2',
      '-filed2',
      'filed3',
      '-filed3',
    ]);
  });
});
