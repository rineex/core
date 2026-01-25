import { DomainError, DomainErrorCode, DomainErrorType } from '@rineex/ddd';

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
export class MfaActiveChallengeExistsError extends DomainError {
  readonly code: DomainErrorCode = 'AUTH_CORE_MFA.ACTIVE_CHALLENGE_EXISTS';
  readonly message = 'An active MFA challenge already exists';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_STATE';

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
