import { DomainError, DomainErrorCode, DomainErrorType } from '@/shared';

/**
 * Custom error class for entity validation failures.
 */
export class EntityValidationError extends DomainError {
  public code: DomainErrorCode = 'CORE.VALIDATION_FAILED';
  public type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  public static create(msg: string) {
    return new EntityValidationError(msg);
  }
}
