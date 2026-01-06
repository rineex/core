import { DomainViolation } from '@rineex/ddd';

/**
 * Domain violation representing a failed OTP attempt.
 * In Hexagonal Architecture, this belongs in:
 */
export class OtpAuthenticationViolation extends DomainViolation {
  public get code() {
    return 'OTP_AUTHENTICATION_FAILED';
  }

  public readonly message: string;

  /**
   * @param {string} [message='Invalid or expired OTP code'] - Obfuscated message for security.
   * @param {Record<string, unknown>} [metadata] - Optional context for internal logging (e.g., attempt count).
   */
  constructor(
    message = 'Invalid or expired OTP code',
    metadata: { attemptsUsed?: number; reason?: string } = {},
  ) {
    super(metadata);
    this.message = message;
  }
}
