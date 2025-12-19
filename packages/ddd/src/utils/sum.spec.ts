import { describe, expect, it } from 'vitest';

import { sum } from './sum';

describe('sum', () => {
  it('should return 0 for no arguments', () => {
    expect(sum()).toBe(0);
  });

  it('should return the single number when given one argument', () => {
    expect(sum(5)).toBe(5);
  });

  it('should return the sum of multiple numbers', () => {
    expect(sum(1, 2, 3)).toBe(6);
  });

  it('should return the sum of negative numbers', () => {
    expect(sum(-1, -2, -3)).toBe(-6);
  });

  it('should handle mixed positive and negative numbers', () => {
    expect(sum(10, -5, 3, -2)).toBe(6);
  });

  it('should handle zero in the arguments', () => {
    expect(sum(0, 5, 0)).toBe(5);
  });

  it('should handle decimal numbers', () => {
    expect(sum(1.5, 2.5, 1)).toBe(5);
  });
});
