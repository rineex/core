import { DomainError } from '../base/domain.error';

/**
 * Custom error class for entity validation failures.
 */
export class EntityValidationError extends DomainError {
  constructor(message: string, cause?: Error) {
    super(message, 'ENTITY_VALIDATION_ERROR', { cause });
  }
}
