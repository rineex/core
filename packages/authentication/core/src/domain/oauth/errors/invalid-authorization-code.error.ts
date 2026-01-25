import {
  DomainError,
  DomainErrorCode,
  DomainErrorType,
  Metadata,
} from '@rineex/ddd';

type Props = Metadata<Record<string, unknown>>;

/**
 * Raised when an authorization code is invalid.
 *
 * @remarks
 * This error is thrown when an OAuth authorization code fails validation:
 * - Code format is invalid
 * - Code doesn't exist
 * - Code belongs to a different client
 * - Code has been tampered with
 *
 * @example
 * ```typescript
 * // Thrown when authorization code is invalid
 * throw InvalidAuthorizationCodeError.create({ code: 'invalid_code' });
 * ```
 */
export class InvalidAuthorizationCodeError extends DomainError<Props> {
  readonly code: DomainErrorCode = 'AUTH_CORE_OAUTH.INVALID_AUTHORIZATION_CODE';
  readonly message = 'Authorization code is invalid';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_VALUE';

  /**
   * Creates a new InvalidAuthorizationCodeError instance.
   *
   * @param details - Optional metadata about the validation failure
   * @returns New InvalidAuthorizationCodeError instance
   */
  public static create(
    details?: Record<string, unknown>,
  ): InvalidAuthorizationCodeError {
    return new InvalidAuthorizationCodeError(
      'Authorization code is invalid',
      details ?? {},
    );
  }
}
