import { describe, expect, it } from 'vitest';

import { HttpStatusMessage } from '@/gateway/constants/http-code';

import { ApplicationError } from '../application.error';

// Test implementation
class TestApplicationError extends ApplicationError {
  constructor(message: string) {
    super({
      code: HttpStatusMessage['400'],
      isOperational: true,
      message,
    });
  }
}

describe('applicationError', () => {
  describe('constructor', () => {
    it('should create an application error with all properties', () => {
      const error = new TestApplicationError('Test error message');

      expect(error.message).toBe('Test error message');
      expect(error.code).toBe(HttpStatusMessage['400']);
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('TestApplicationError');
    });

    it('should use default values when not provided', () => {
      class DefaultError extends ApplicationError {
        constructor(message: string) {
          super({
            code: HttpStatusMessage['500'],
            message,
          });
        }
      }

      const error = new DefaultError('Test error');

      expect(error.message).toBe('Test error');
      expect(error.code).toBe(HttpStatusMessage['500']);
      expect(error.isOperational).toBe(false);
    });

    it('should store metadata', () => {
      const metadata = { userId: 'user-1', action: 'login' };
      class MetadataError extends ApplicationError {
        constructor(message: string) {
          super({
            code: HttpStatusMessage['500'],
            metadata,
            message,
          });
        }
      }

      const error = new MetadataError('Test error');

      expect(error.metadata).toEqual(metadata);
    });

    it('should store cause', () => {
      const cause = new Error('Original error');
      class CauseError extends ApplicationError {
        constructor(message: string) {
          super({
            code: HttpStatusMessage['500'],
            message,
            cause,
          });
        }
      }

      const error = new CauseError('Test error');

      expect(error.cause).toBe(cause);
    });

    it('should capture stack trace', () => {
      const error = new TestApplicationError('Test error');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('TestApplicationError');
    });
  });

  describe('inheritance', () => {
    it('should be instance of Error', () => {
      const error = new TestApplicationError('Test error');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApplicationError);
    });
  });
});
