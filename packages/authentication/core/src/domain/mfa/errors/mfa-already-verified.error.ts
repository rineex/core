import { DomainError } from '@rineex/ddd';

/**
 * Raised when an MFA session is already verified.
 *
 * @remarks
 * This error is thrown when attempting to verify an MFA session that has already
 * been successfully verified. MFA sessions can only be verified once.
 *
 * @example
 * ```typescript
 * // Thrown when trying to verify an already verified session
 * if (mfaSession.isVerified()) {
 *   throw MfaAlreadyVerifiedError.create();
 * }
 * ```
 */
export class MfaAlreadyVerifiedError extends DomainError<'AUTH_CORE_MFA.ALREADY_VERIFIED'> {
  readonly code = 'AUTH_CORE_MFA.ALREADY_VERIFIED' as const;
  readonly message = 'MFA session is already verified';

  /**
   * Creates a new MfaAlreadyVerifiedError instance.
   *
   * @returns New MfaAlreadyVerifiedError instance
   */
  static create(): MfaAlreadyVerifiedError {
    return new MfaAlreadyVerifiedError('MFA session is already verified', {});
  }
}
