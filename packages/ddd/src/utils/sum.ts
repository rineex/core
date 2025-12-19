/**
 * Sums a variable number of numeric values.
 * @param num - The numbers to sum.
 * @returns The sum of all provided numbers.
 */
export const sum = (...num: number[]) =>
  num.reduce((a: number, c: number) => a + c, 0);
