import { describe, expect, it } from 'vitest';

import { InvalidStateError } from '../invalid-state.error';
import { DomainError } from '../../domain.error';

describe('invalidStateError', () => {
  describe('constructor', () => {
    it('should create an invalid state error with default message', () => {
      const error = new InvalidStateError();

      expect(error.message).toBe('invalid state');
      expect(error.code).toBe('DOMAIN.INVALID_STATE');
      expect(error.type).toBe('DOMAIN.INVALID_STATE');
    });

    it('should create an invalid state error with custom message', () => {
      const error = new InvalidStateError('Custom error message');

      expect(error.message).toBe('Custom error message');
      expect(error.code).toBe('DOMAIN.INVALID_STATE');
    });

    it('should be instance of DomainError', () => {
      const error = new InvalidStateError();

      expect(error).toBeInstanceOf(DomainError);
    });
  });

  describe('toObject', () => {
    it('should serialize to object', () => {
      const error = new InvalidStateError('Test error');
      const obj = error.toObject();

      expect(obj).toEqual({
        code: 'DOMAIN.INVALID_STATE',
        type: 'DOMAIN.INVALID_STATE',
        message: 'Test error',
        metadata: {},
      });
    });
  });

  describe('toString', () => {
    it('should return formatted string', () => {
      const error = new InvalidStateError('Test error');

      expect(error.toString()).toBe('[DOMAIN.INVALID_STATE] Test error');
    });
  });
});
