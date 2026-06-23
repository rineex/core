import { DomainError } from '@rineex/ddd';

/**
 * Raised when an MFA challenge or session has expired.
 *
 * @remarks
 * This error is thrown when an MFA session or challenge has passed its expiration time.
 * Used for both challenge expiration and session expiration scenarios.
 *
 * @example
 * ```typescript
 * // Thrown when MFA session is expired
 * if (mfaSession.isExpired(now)) {
 *   throw MfaExpiredError.create();
 * }
 * ```
 */
export class MfaExpiredError extends DomainError<'AUTH_CORE_MFA.EXPIRED'> {
  readonly code = 'AUTH_CORE_MFA.EXPIRED' as const;
  readonly message = 'MFA challenge or session has expired';

  /**
   * Creates a new MfaExpiredError instance.
   *
   * @returns New MfaExpiredError instance
   */
  static create(): MfaExpiredError {
    return new MfaExpiredError('MFA challenge or session has expired', {});
  }
}
