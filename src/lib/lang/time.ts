import dayjs, { ManipulateType } from 'dayjs';
import { isNil } from 'lodash';

/** Duration defines duration in milliseconds, the default time unit in Javascript. */
export const enum Duration {
  MILLISECOND = 1,
  SECOND = 1000 * MILLISECOND,
  MINUTE = 60 * SECOND,
  HOUR = 60 * MINUTE,
}

/**
 * A delay promise
 * @param {Number} ms delay miliseconds
 */
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Format time
 * @param {Date} date
 */
export function ymdhms(date: string | Date | number) {
  if (isNil(date)) return date;
  if (typeof date === 'string' && isNaN(Date.parse(date))) return date;
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
}

/**
 * Format time
 * @param {Date} date
 */
export function ymd(date: string | Date | number) {
  if (isNil(date)) return date;
  if (typeof date === 'string' && isNaN(Date.parse(date))) return date;
  return dayjs(date).format('YYYY-MM-DD');
}

/**
 * Format time
 * @param {Date} Date
 */

export function ym(date: string | Date | number) {
  if (isNil(date)) return date;
  if (typeof date === 'string' && isNaN(Date.parse(date))) return date;
  return dayjs(date).format('YYYY-MM');
}

export function splitShortTimeSpan(timeSpan: string): [number, ManipulateType] {
  const match = timeSpan.match(
    /^(\d+)(d|D|M|y|h|m|s|ms|w|milliseconds?|seconds?|minutes?|hours?|days?|months?|years?|weeks?)$/
  );
  if (!match) {
    throw new Error('invalid short timeSpan');
  }
  return [+match[1], match[2] as ManipulateType];
}

export function addShortTimeSpan(timeSpan: string, date?: Date): Date {
  const [span, unit] = splitShortTimeSpan(timeSpan);
  return dayjs(date).add(span, unit).toDate();
}
