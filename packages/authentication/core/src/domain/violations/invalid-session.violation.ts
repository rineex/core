import { DomainError, DomainErrorCode, DomainErrorType } from '@rineex/ddd';

/**
 * Raised when a session invariant is violated.
 */
export class InvalidSessionDomainError extends DomainError {
  readonly code: DomainErrorCode = 'AUTH_CORE_SESSION.INVALID';
  readonly message = 'Session state is invalid';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  public static create(): InvalidSessionDomainError {
    return new InvalidSessionDomainError('Session state is invalid');
  }
}
