import {
  DomainError,
  DomainErrorCode,
  DomainErrorType,
  Metadata,
} from '@rineex/ddd';

type ExtraProps = {
  attemptsUsed?: number;
  reason?: string;
};

type Props = Metadata<ExtraProps>;

/**
 * Raised when OTP authentication fails.
 *
 * @remarks
 * This error is thrown when:
 * - OTP code is invalid
 * - OTP code has expired
 * - Maximum attempts exceeded
 * - OTP verification fails for any reason
 *
 * @example
 * ```typescript
 * // Thrown when OTP is invalid
 * throw OtpAuthenticationError.create('Invalid or expired OTP code', {
 *   attemptsUsed: 3,
 *   reason: 'code_mismatch'
 * });
 * ```
 */
export class OtpAuthenticationError extends DomainError<Props> {
  public readonly code: DomainErrorCode = 'AUTH_OTP.AUTHENTICATION_FAILED';
  public readonly type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  /**
   * Creates a new OtpAuthenticationError instance.
   *
   * @param message - Obfuscated message for security (defaults to 'Invalid or expired OTP code')
   * @param metadata - Optional context for internal logging (e.g., attempt count, reason)
   * @returns New OtpAuthenticationError instance
   */
  constructor(
    message: string = 'Invalid or expired OTP code',
    metadata: Props = {},
  ) {
    super(message, metadata);
  }

  /**
   * Creates a new OtpAuthenticationError instance.
   *
   * @param message - Obfuscated message for security
   * @param metadata - Optional context for internal logging
   * @returns New OtpAuthenticationError instance
   */
  static create(
    message: string = 'Invalid or expired OTP code',
    metadata: Props = {},
  ): OtpAuthenticationError {
    return new OtpAuthenticationError(message, metadata);
  }
}
