export function assert(condition: boolean, msg = 'error occured') {
  if (!condition) {
    throw new Error(msg);
  }
}
