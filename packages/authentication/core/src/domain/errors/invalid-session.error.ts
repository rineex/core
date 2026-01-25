import { DomainError, DomainErrorCode, DomainErrorType } from '@rineex/ddd';

/**
 * Raised when a session invariant is violated.
 *
 * @remarks
 * This error is thrown when a session is in an invalid state for the requested operation.
 * Common scenarios include:
 * - Session has expired
 * - Session is inactive
 * - Session state transition is invalid
 * - Session data is corrupted
 *
 * @example
 * ```typescript
 * // Thrown when session is invalid
 * if (!session.isValid()) {
 *   throw InvalidSessionError.create();
 * }
 * ```
 */
export class InvalidSessionError extends DomainError {
  readonly code: DomainErrorCode = 'AUTH_CORE_SESSION.INVALID';
  readonly message = 'Session state is invalid';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  /**
   * Creates a new InvalidSessionError instance.
   *
   * @returns New InvalidSessionError instance
   */
  public static create(): InvalidSessionError {
    return new InvalidSessionError('Session state is invalid', {});
  }
}
