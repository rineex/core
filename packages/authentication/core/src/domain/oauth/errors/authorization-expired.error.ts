import { DomainError, DomainErrorCode, DomainErrorType } from '@rineex/ddd';

/**
 * Raised when an OAuth authorization has expired.
 *
 * @remarks
 * This error is thrown when attempting to use an OAuth authorization that has
 * passed its expiration time. Authorizations have a limited validity window
 * for security purposes.
 *
 * @example
 * ```typescript
 * // Thrown when authorization is expired
 * if (authorization.isExpired(now)) {
 *   throw AuthorizationExpiredError.create();
 * }
 * ```
 */
export class AuthorizationExpiredError extends DomainError {
  readonly code: DomainErrorCode = 'AUTH_CORE_OAUTH.AUTHORIZATION_EXPIRED';
  readonly message = 'The OAuth authorization has expired';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  /**
   * Creates a new AuthorizationExpiredError instance.
   *
   * @returns New AuthorizationExpiredError instance
   */
  public static create(): AuthorizationExpiredError {
    return new AuthorizationExpiredError(
      'The OAuth authorization has expired',
      {},
    );
  }
}
