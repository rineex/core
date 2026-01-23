import { describe, expect, it } from 'vitest';

import { EntityValidationError } from '../entity-validation.error';
import { DomainError } from '../../../shared/domain/domain.error';

describe('EntityValidationError', () => {
  describe('constructor', () => {
    it('should create an entity validation error', () => {
      const error = new EntityValidationError('Validation failed');

      expect(error.message).toBe('Validation failed');
      expect(error.code).toBe('CORE.VALIDATION_FAILED');
      expect(error.type).toBe('DOMAIN.INVALID_STATE');
    });

    it('should be instance of DomainError', () => {
      const error = new EntityValidationError('Validation failed');

      expect(error).toBeInstanceOf(DomainError);
    });
  });

  describe('create', () => {
    it('should create error using static factory', () => {
      const error = EntityValidationError.create('Custom message');

      expect(error).toBeInstanceOf(EntityValidationError);
      expect(error.message).toBe('Custom message');
      expect(error.code).toBe('CORE.VALIDATION_FAILED');
    });
  });

  describe('toObject', () => {
    it('should serialize to object', () => {
      const error = new EntityValidationError('Validation failed');
      const obj = error.toObject();

      expect(obj).toEqual({
        code: 'CORE.VALIDATION_FAILED',
        message: 'Validation failed',
        type: 'DOMAIN.INVALID_STATE',
        metadata: {},
      });
    });
  });
});
