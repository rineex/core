import { DomainError } from '@rineex/ddd';

/**
 * Raised when attempting to create a new MFA challenge while an active one already exists.
 *
 * @remarks
 * This error is thrown when trying to issue a new MFA challenge for an identity
 * that already has an active (non-expired, non-verified) challenge. Only one
 * active challenge is allowed per identity at a time.
 *
 * @example
 * ```typescript
 * // Thrown when active challenge exists
 * if (await hasActiveChallenge(identityId)) {
 *   throw MfaActiveChallengeExistsError.create();
 * }
 * ```
 */
export class MfaActiveChallengeExistsError extends DomainError<'AUTH_CORE_MFA.ACTIVE_CHALLENGE_EXISTS'> {
  readonly code = 'AUTH_CORE_MFA.ACTIVE_CHALLENGE_EXISTS' as const;
  readonly message = 'An active MFA challenge already exists';

  /**
   * Creates a new MfaActiveChallengeExistsError instance.
   *
   * @returns New MfaActiveChallengeExistsError instance
   */
  static create(): MfaActiveChallengeExistsError {
    return new MfaActiveChallengeExistsError(
      'An active MFA challenge already exists',
      {},
    );
  }
}
