export const toFixed =
  (precision = 0) =>
  (x: number | string) =>
    Number.parseFloat(x as string).toFixed(precision);

export const toPercent =
  (precision = 1) =>
  (x: number | string) =>
    (Number.parseFloat(x as string) * 100).toFixed(precision) + '%';

export function isNumber(value?: string | number): boolean {
  return value != null && value !== '' && !isNaN(Number(value.toString()));
}

export function countTailZero(value: number): number {
  const nw = Math.floor(value / 10);
  if (nw * 10 === value) {
    return 1 + countTailZero(nw);
  }
  return 0;
}
