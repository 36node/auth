import { SetMetadata } from '@nestjs/common';
import { concat, forEach, uniq } from 'lodash';

/**
 * 可排序字段在metadata中的key
 */
export const METADATA_KEY_SORT_FIELDS = 'sortFields';

/**
 * 可排序字段的装饰器
 */
export const SortFields = (flelds: string[]) => SetMetadata(METADATA_KEY_SORT_FIELDS, flelds);

/**
 * 获取一个schema中设置的可排序字段
 * @param target schema类
 * @returns string[] 排序字段列表
 */
export const getSortableFields = (target: any): string[] => {
  const fields = Reflect.getMetadata(METADATA_KEY_SORT_FIELDS, target) || [];
  return uniq(fields);
};

/**
 * 将可排序字段改造为携带排序方向的参数
 * @param sortableFileds 可排序字段列表
 * @returns string[] 携带排序方向的参数列表
 */
export const toSortParams = (sortableFileds: string[]): string[] => {
  const sortParams = [];
  forEach(sortableFileds, (field) => {
    sortParams.push(field);
    sortParams.push(`-${field}`);
  });
  return sortParams;
};

/**
 * 根据一个schema中设置的可排序字段，获取适合query的请求参数(默认添加createAt和updateAt两个排序字段)
 * @param target schema类
 * @returns string[] 携带排序方向的参数列表
 */
export const getSortParams = (target: any): string[] => {
  return toSortParams(concat(['createAt', 'updateAt'], getSortableFields(target)));
};
