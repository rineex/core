import {
  DomainError,
  DomainErrorCode,
  DomainErrorType,
  Metadata,
} from '@rineex/ddd';

type ExtraProps = {
  attemptsUsed: number;
  maxAttempts: number;
};

type Props = Metadata<ExtraProps>;

/**
 * Raised when the maximum number of MFA verification attempts has been exceeded.
 *
 * @remarks
 * This error is thrown when an identity has exceeded the allowed number of
 * MFA verification attempts. This is a security measure to prevent brute-force attacks.
 *
 * @example
 * ```typescript
 * // Thrown when attempts exceeded
 * if (attempts >= maxAttempts) {
 *   throw MfaAttemptsExceededError.create(attempts, maxAttempts);
 * }
 * ```
 */
export class MfaAttemptsExceededError extends DomainError<Props> {
  readonly code: DomainErrorCode = 'AUTH_CORE_MFA.ATTEMPTS_EXCEEDED';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  /**
   * Creates a new MfaAttemptsExceededError instance.
   *
   * @param attemptsUsed - Number of attempts that were used
   * @param maxAttempts - Maximum number of allowed attempts
   * @returns New MfaAttemptsExceededError instance
   */
  static create(
    attemptsUsed: number,
    maxAttempts: number,
  ): MfaAttemptsExceededError {
    return new MfaAttemptsExceededError(
      `Maximum MFA verification attempts exceeded (${attemptsUsed}/${maxAttempts})`,
      { attemptsUsed, maxAttempts },
    );
  }
}
