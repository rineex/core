import { DomainError, DomainErrorCode, DomainErrorType } from '@rineex/ddd';

/**
 * Raised when an MFA challenge has expired.
 *
 * @remarks
 * This error is thrown when attempting to use an MFA challenge that has passed
 * its expiration time. Challenges have a limited validity window for security purposes.
 *
 * @example
 * ```typescript
 * // Thrown when challenge is expired
 * if (challenge.isExpired(now)) {
 *   throw MfaChallengeExpiredError.create();
 * }
 * ```
 */
export class MfaChallengeExpiredError extends DomainError {
  readonly code: DomainErrorCode = 'AUTH_CORE_MFA.CHALLENGE_EXPIRED';
  readonly message = 'MFA challenge has expired';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  /**
   * Creates a new MfaChallengeExpiredError instance.
   *
   * @returns New MfaChallengeExpiredError instance
   */
  static create(): MfaChallengeExpiredError {
    return new MfaChallengeExpiredError('MFA challenge has expired', {});
  }
}
