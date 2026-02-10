import { describe, expect, it } from 'vitest';

import { DEFAULT_POOL_NAME } from './constants';
import { InjectPool } from './slonik.decorator';
import { createSlonikToken } from './slonik.util';

describe('injectPool', () => {
  it('should return a decorator function when no name provided', () => {
    const result = InjectPool();

    expect(result).toBeDefined();
    expect(typeof result).toBe('function');
    expect(createSlonikToken(DEFAULT_POOL_NAME)).toBe(
      '__SLONIK_DEFAULT_POOL__',
    );
  });

  it('should return a decorator function for given pool name', () => {
    const result = InjectPool('REPLICA');

    expect(result).toBeDefined();
    expect(typeof result).toBe('function');
    expect(createSlonikToken('REPLICA')).toBe('__SLONIK_REPLICA_POOL__');
  });

  it('should use token consistent with createSlonikToken for the same name', () => {
    const name = 'CUSTOM';
    InjectPool(name);

    expect(createSlonikToken(name)).toBe('__SLONIK_CUSTOM_POOL__');
  });
});
