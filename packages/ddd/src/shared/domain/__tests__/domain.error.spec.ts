import { describe, expect, it } from 'vitest';

import { InvalidValueError } from '../errors/invalid-value.error';
import { DomainError } from '../domain.error';

class SampleDomainError extends DomainError<
  'DOMAIN.INVALID_VALUE',
  { field: string }
> {
  readonly code = 'DOMAIN.INVALID_VALUE' as const;
}

describe('domainError', () => {
  describe('constructor', () => {
    it('should freeze metadata', () => {
      const error = new SampleDomainError('bad', { field: 'email' });

      expect(Object.isFrozen(error.metadata)).toBe(true);
      expect(error.metadata).toEqual({ field: 'email' });
    });

    it('should default metadata to empty object', () => {
      const error = new InvalidValueError();

      expect(error.metadata).toEqual({});
    });
  });

  describe('getters', () => {
    it('should expose namespace and errorName from code', () => {
      const error = new SampleDomainError('bad', { field: 'email' });

      expect(error.namespace).toBe('DOMAIN');
      expect(error.errorName).toBe('INVALID_VALUE');
    });
  });

  describe('isInstance', () => {
    it('should narrow unknown values', () => {
      const error = new InvalidValueError();

      expect(DomainError.isInstance(error)).toBe(true);
      expect(DomainError.isInstance(new Error('x'))).toBe(false);
    });
  });

  describe('toObject', () => {
    it('should serialize code, message, and metadata', () => {
      const error = new SampleDomainError('bad', { field: 'email' });

      expect(error.toObject()).toEqual({
        code: 'DOMAIN.INVALID_VALUE',
        metadata: { field: 'email' },
        message: 'bad',
      });
    });
  });

  describe('toString', () => {
    it('should format as [CODE] message', () => {
      const error = new SampleDomainError('bad', { field: 'email' });

      expect(error.toString()).toBe('[DOMAIN.INVALID_VALUE] bad');
    });
  });
});
