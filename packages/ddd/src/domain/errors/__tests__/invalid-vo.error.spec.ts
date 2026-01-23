import { describe, expect, it } from 'vitest';

import { InvalidValueObjectError } from '../invalid-vo.error';
import { DomainError } from '../../../shared/domain/domain.error';

describe('InvalidValueObjectError', () => {
  describe('constructor', () => {
    it('should create an invalid value object error', () => {
      const error = InvalidValueObjectError.create('Invalid value', {
        value: 'test',
      });

      expect(error.message).toBe('Invalid value');
      expect(error.code).toBe('DOMAIN.INVALID_VALUE');
      expect(error.type).toBe('DOMAIN.INVALID_VALUE');
      expect(error.metadata).toEqual({ value: 'test' });
    });

    it('should be instance of DomainError', () => {
      const error = InvalidValueObjectError.create('Invalid value');

      expect(error).toBeInstanceOf(DomainError);
    });
  });

  describe('create', () => {
    it('should create error using static factory', () => {
      const error = InvalidValueObjectError.create('Custom message', {
        value: 'test',
      });

      expect(error).toBeInstanceOf(InvalidValueObjectError);
      expect(error.message).toBe('Custom message');
      expect(error.metadata).toEqual({ value: 'test' });
    });

    it('should create error without metadata', () => {
      const error = InvalidValueObjectError.create('Custom message');

      expect(error.message).toBe('Custom message');
      expect(error.metadata).toEqual({});
    });
  });

  describe('toObject', () => {
    it('should serialize to object', () => {
      const error = InvalidValueObjectError.create('Invalid value', {
        value: 'test',
      });
      const obj = error.toObject();

      expect(obj).toEqual({
        code: 'DOMAIN.INVALID_VALUE',
        message: 'Invalid value',
        type: 'DOMAIN.INVALID_VALUE',
        metadata: { value: 'test' },
      });
    });
  });
});
