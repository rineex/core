import { DomainError, DomainErrorCode, DomainErrorType } from '@rineex/ddd';

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
export class MfaAlreadyVerifiedError extends DomainError {
  readonly code: DomainErrorCode = 'AUTH_CORE_MFA.ALREADY_VERIFIED';
  readonly message = 'MFA session is already verified';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  /**
   * Creates a new MfaAlreadyVerifiedError instance.
   *
   * @returns New MfaAlreadyVerifiedError instance
   */
  static create(): MfaAlreadyVerifiedError {
    return new MfaAlreadyVerifiedError('MFA session is already verified', {});
  }
}
