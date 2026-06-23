import { DomainError } from '@rineex/ddd';

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
export class AuthorizationAlreadyUsedError extends DomainError<'AUTH_CORE_OAUTH.AUTHORIZATION_ALREADY_USED'> {
  readonly code = 'AUTH_CORE_OAUTH.AUTHORIZATION_ALREADY_USED' as const;
  readonly message = 'The OAuth authorization has already been used';

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
