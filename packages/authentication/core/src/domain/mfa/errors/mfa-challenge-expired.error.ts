import { DomainError } from '@rineex/ddd';

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
export class MfaChallengeExpiredError extends DomainError<'AUTH_CORE_MFA.CHALLENGE_EXPIRED'> {
  readonly code = 'AUTH_CORE_MFA.CHALLENGE_EXPIRED' as const;
  readonly message = 'MFA challenge has expired';

  /**
   * Creates a new MfaChallengeExpiredError instance.
   *
   * @returns New MfaChallengeExpiredError instance
   */
  static create(): MfaChallengeExpiredError {
    return new MfaChallengeExpiredError('MFA challenge has expired', {});
  }
}
