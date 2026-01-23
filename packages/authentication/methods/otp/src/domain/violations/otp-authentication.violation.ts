import { DomainError, DomainErrorType } from '@rineex/ddd';

/**
 * Domain violation representing a failed OTP attempt.
 * In Hexagonal Architecture, this belongs in:
 */
export class OtpAuthenticationViolation extends DomainError {
  public readonly message: string = 'Invalid or expired OTP code';
  public readonly type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  public get code() {
    return 'OTP_AUTHENTICATION_FAILED';
  }

  /**
   * @param {string} [message='Invalid or expired OTP code'] - Obfuscated message for security.
   * @param {Record<string, unknown>} [metadata] - Optional context for internal logging (e.g., attempt count).
   */
  constructor(metadata: { attemptsUsed?: number; reason?: string } = {}) {
    super(metadata);
  }
}
