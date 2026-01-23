import { describe, expect, it } from 'vitest';

import { TimeoutError } from '../timeout.error';
import { DomainError } from '../../domain.error';

describe('TimeoutError', () => {
  describe('constructor', () => {
    it('should create a timeout error', () => {
      const error = new TimeoutError('Operation timed out');

      expect(error.message).toBe('Operation timed out');
      expect(error.code).toBe('SYSTEM.TIMEOUT');
      expect(error.type).toBe('DOMAIN.INVALID_STATE');
    });

    it('should create a timeout error with metadata', () => {
      const metadata = { url: 'https://example.com', timeoutMs: 5000 };
      const error = new TimeoutError('Request timed out', metadata);

      expect(error.message).toBe('Request timed out');
      expect(error.metadata).toEqual(metadata);
    });

    it('should be instance of DomainError', () => {
      const error = new TimeoutError('Timeout');

      expect(error).toBeInstanceOf(DomainError);
    });
  });

  describe('toObject', () => {
    it('should serialize to object', () => {
      const error = new TimeoutError('Test timeout', { url: 'test.com' });
      const obj = error.toObject();

      expect(obj).toEqual({
        code: 'SYSTEM.TIMEOUT',
        message: 'Test timeout',
        type: 'DOMAIN.INVALID_STATE',
        metadata: { url: 'test.com' },
      });
    });
  });

  describe('toString', () => {
    it('should return formatted string', () => {
      const error = new TimeoutError('Test timeout');

      expect(error.toString()).toBe('[SYSTEM.TIMEOUT] Test timeout');
    });
  });
});
