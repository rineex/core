import { describe, expect, it } from 'vitest';

import { AuthFactor } from '../auth-factor.vo';

describe('authFactor', () => {
  it('should create a valid AuthFactor with a valid identifier', () => {
    const factor = AuthFactor.create('password');

    expect(factor.toString()).toBe('password');
  });

  it('should create a valid AuthFactor with different factor types', () => {
    const factors = ['mfa', 'biometric', 'email', 'sms'];

    factors.forEach(factorType => {
      const factor = AuthFactor.create(factorType as any);

      expect(factor.toString()).toBe(factorType);
    });
  });

  it('should throw an error when created with empty value', () => {
    expect(() => AuthFactor.create('' as any)).toThrow(
      'AuthFactor must be a valid identifier',
    );
  });

  it('should throw an error when created with null value', () => {
    expect(() => AuthFactor.create(null as any)).toThrow(
      'AuthFactor must be a valid identifier',
    );
  });

  it('should throw an error when created with undefined value', () => {
    expect(() => AuthFactor.create(undefined as any)).toThrow(
      'AuthFactor must be a valid identifier',
    );
  });
});
