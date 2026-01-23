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
 * Domain violation representing a failed OTP attempt.
 * In Hexagonal Architecture, this belongs in:
 */
export class OtpAuthenticationViolation extends DomainError<Props> {
  public readonly code: DomainErrorCode = 'AUTH_OTP.AUTHENTICATION_FAILED';
  public readonly type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  /**
   * @param {string} [message='Invalid or expired OTP code'] - Obfuscated message for security.
   * @param {Props} [metadata] - Optional context for internal logging (e.g., attempt count).
   */
  constructor(
    message: string = 'Invalid or expired OTP code',
    metadata: Props = {},
  ) {
    super(message, metadata);
  }
}
