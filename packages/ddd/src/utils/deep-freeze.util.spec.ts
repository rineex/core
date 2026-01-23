import { describe, expect, it } from 'vitest';

import { deepFreeze } from './deep-freeze.util';

describe('deepFreeze', () => {
  it('should return primitive values unchanged', () => {
    expect(deepFreeze(42)).toBe(42);
    expect(deepFreeze('hello')).toBe('hello');
    expect(deepFreeze(null)).toBeNull();
    expect(deepFreeze(undefined)).toBeUndefined();
  });

  it('should freeze a simple object', () => {
    const obj = { b: 'test', a: 1 };
    const frozen = deepFreeze(obj);

    expect(Object.isFrozen(frozen)).toBe(true);
    expect(() => {
      (frozen as any).a = 2;
    }).toThrowError('Cannot assign to read only property');
    expect(frozen).toEqual({ b: 'test', a: 1 });
  });

  it('should deeply freeze nested objects', () => {
    const obj = { a: { b: { c: 1 } } };
    const frozen = deepFreeze(obj);

    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isFrozen(frozen.a)).toBe(true);
    expect(Object.isFrozen(frozen.a.b)).toBe(true);
    expect(() => {
      (frozen.a.b as any).c = 2;
    }).toThrow('Cannot assign to read only property');
    expect(frozen.a.b.c).toBe(1);
  });

  it('should freeze arrays and their elements', () => {
    const arr = [{ a: 1 }, { b: 2 }];
    const frozen = deepFreeze(arr);

    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isFrozen(frozen[0])).toBe(true);
    expect(Object.isFrozen(frozen[1])).toBe(true);
    expect(() => {
      (frozen[0] as any).a = 3;
    }).toThrow('Cannot assign to read only property');
    expect(frozen[0].a).toBe(1);
  });

  it('should handle circular references', () => {
    const obj: any = { a: 1 };
    obj.self = obj;
    const frozen = deepFreeze(obj);

    expect(Object.isFrozen(frozen)).toBe(true);
    expect(frozen.self).toBe(frozen);
    expect(() => {
      (frozen as any).a = 2;
    }).toThrow('Cannot assign to read only property');
  });

  it('should not re-freeze already frozen objects', () => {
    const obj = Object.freeze({ a: 1 });
    const frozen = deepFreeze(obj);

    expect(frozen).toBe(obj); // Should return the same object
    expect(Object.isFrozen(frozen)).toBe(true);
  });

  it('should handle empty objects and arrays', () => {
    const emptyObj = {};
    const emptyArr: any[] = [];
    const frozenObj = deepFreeze(emptyObj);
    const frozenArr = deepFreeze(emptyArr);

    expect(Object.isFrozen(frozenObj)).toBe(true);
    expect(Object.isFrozen(frozenArr)).toBe(true);
  });
});
