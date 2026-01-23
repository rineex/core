import { describe, expect, it } from 'vitest';

import { InternalError } from '../internal.error';
import { DomainError } from '../../domain.error';

describe('internalError', () => {
  describe('constructor', () => {
    it('should create an internal error with default message', () => {
      const error = new InternalError();

      expect(error.message).toBe('An unexpected internal error occurred');
      expect(error.code).toBe('CORE.INTERNAL_ERROR');
      expect(error.type).toBe('DOMAIN.INVALID_STATE');
    });

    it('should create an internal error with custom message', () => {
      const error = new InternalError('Custom error message');

      expect(error.message).toBe('Custom error message');
      expect(error.code).toBe('CORE.INTERNAL_ERROR');
    });

    it('should create an internal error with metadata', () => {
      const metadata = { timestamp: Date.now(), userId: 'user-1' };
      const error = new InternalError('Error occurred', metadata);

      expect(error.message).toBe('Error occurred');
      expect(error.metadata).toEqual(metadata);
    });

    it('should be instance of DomainError', () => {
      const error = new InternalError();

      expect(error).toBeInstanceOf(DomainError);
    });
  });

  describe('toObject', () => {
    it('should serialize to object', () => {
      const error = new InternalError('Test error', { userId: 'user-1' });
      const obj = error.toObject();

      expect(obj).toEqual({
        metadata: { userId: 'user-1' },
        type: 'DOMAIN.INVALID_STATE',
        code: 'CORE.INTERNAL_ERROR',
        message: 'Test error',
      });
    });
  });

  describe('toString', () => {
    it('should return formatted string', () => {
      const error = new InternalError('Test error');

      expect(error.toString()).toBe('[CORE.INTERNAL_ERROR] Test error');
    });
  });
});
