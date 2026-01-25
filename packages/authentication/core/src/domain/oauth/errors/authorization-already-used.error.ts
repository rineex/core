import { DomainError, DomainErrorCode, DomainErrorType } from '@rineex/ddd';

/**
 * Raised when an OAuth authorization has already been used.
 *
 * @remarks
 * This error is thrown when attempting to exchange an authorization code that
 * has already been used to obtain tokens. Authorization codes are single-use only
 * for security purposes.
 *
 * @example
 * ```typescript
 * // Thrown when authorization code is already used
 * if (authorization.isUsed()) {
 *   throw AuthorizationAlreadyUsedError.create();
 * }
 * ```
 */
export class AuthorizationAlreadyUsedError extends DomainError {
  readonly code: DomainErrorCode = 'AUTH_CORE_OAUTH.AUTHORIZATION_ALREADY_USED';
  readonly message = 'The OAuth authorization has already been used';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  /**
   * Creates a new AuthorizationAlreadyUsedError instance.
   *
   * @returns New AuthorizationAlreadyUsedError instance
   */
  public static create(): AuthorizationAlreadyUsedError {
    return new AuthorizationAlreadyUsedError(
      'The OAuth authorization has already been used',
      {},
    );
  }
}
