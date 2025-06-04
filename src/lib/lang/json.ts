export const tryParseJSON = (str: string) => {
  try {
    return JSON.parse(str);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {}
};
