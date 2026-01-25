import {
  DomainError,
  DomainErrorCode,
  DomainErrorType,
  Metadata,
} from '@rineex/ddd';

type ExtraProps = {
  actualLength: number;
  minLength: number;
};

type Props = Metadata<ExtraProps>;

/**
 * Raised when an authentication token violates domain invariants.
 *
 * @remarks
 * This error is thrown when a token fails validation rules such as:
 * - Token length is below the minimum required length
 * - Token format is invalid
 * - Token structure violates domain constraints
 *
 * @example
 * ```typescript
 * // Thrown when token is too short
 * throw InvalidAuthTokenError.create(
 *   'Authentication token is invalid',
 *   { actualLength: 20, minLength: 32 }
 * );
 * ```
 */
export class InvalidAuthTokenError extends DomainError<Props> {
  readonly code: DomainErrorCode = 'AUTH_CORE_TOKEN.INVALID';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_VALUE';

  /**
   * Creates a new InvalidAuthTokenError instance.
   *
   * @param message - Human-readable error message
   * @param meta - Metadata containing token validation details
   * @returns New InvalidAuthTokenError instance
   */
  public static create(message: string, meta: Props): InvalidAuthTokenError {
    return new InvalidAuthTokenError(message, meta);
  }
}
