import { DomainError } from '@rineex/ddd';

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
export class InvalidSessionError extends DomainError<'AUTH_CORE_SESSION.INVALID'> {
  readonly code = 'AUTH_CORE_SESSION.INVALID' as const;
  readonly message = 'Session state is invalid';

  /**
   * Creates a new InvalidSessionError instance.
   *
   * @returns New InvalidSessionError instance
   */
  public static create(): InvalidSessionError {
    return new InvalidSessionError('Session state is invalid', {});
  }
}
