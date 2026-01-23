import { describe, expect, it } from 'vitest';

import { InvalidValueError } from '../invalid-value.error';
import { DomainError } from '../../domain.error';

describe('InvalidValueError', () => {
  describe('constructor', () => {
    it('should create an invalid value error with default message', () => {
      const error = new InvalidValueError();

      expect(error.message).toBe('invalid value');
      expect(error.code).toBe('DOMAIN.INVALID_VALUE');
      expect(error.type).toBe('DOMAIN.INVALID_VALUE');
    });

    it('should create an invalid value error with custom message', () => {
      const error = new InvalidValueError('Custom error message');

      expect(error.message).toBe('Custom error message');
      expect(error.code).toBe('DOMAIN.INVALID_VALUE');
    });

    it('should create an invalid value error with metadata', () => {
      const metadata = { field: 'email', value: 'invalid' };
      const error = new InvalidValueError('Invalid email', metadata);

      expect(error.message).toBe('Invalid email');
      expect(error.metadata).toEqual(metadata);
    });

    it('should be instance of DomainError', () => {
      const error = new InvalidValueError();

      expect(error).toBeInstanceOf(DomainError);
    });
  });

  describe('toObject', () => {
    it('should serialize to object', () => {
      const error = new InvalidValueError('Test error', { field: 'email' });
      const obj = error.toObject();

      expect(obj).toEqual({
        code: 'DOMAIN.INVALID_VALUE',
        message: 'Test error',
        type: 'DOMAIN.INVALID_VALUE',
        metadata: { field: 'email' },
      });
    });
  });
});
