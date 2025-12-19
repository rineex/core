export const sum = (...num: number[]) =>
  num.reduce((a: number, c: number) => a + c, 0);
