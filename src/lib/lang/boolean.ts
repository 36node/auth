export function isBoolean(str: string) {
  if (str && /(true|false)/i.test(str)) return true;
}

export function toBoolean(str: string) {
  if (/true/i.test(str)) return true;
  return false;
}
