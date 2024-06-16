/**
 * 数组是否包含一个子数组
 *
 * @param {any[]} srcArr 源数组
 * @param {any[]} subsetArr 子数组
 * @returns {boolean} 布尔值是否包含
 */
export function contain<T>(srcArr: Array<T>, sub: Array<T> | T): boolean {
  if (Array.isArray(sub)) return sub.every((el) => srcArr.includes(el));
  else return srcArr.includes(sub);
}
