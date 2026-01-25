import { DomainError, DomainErrorCode, DomainErrorType } from '@rineex/ddd';

/**
 * Raised when user consent is required for an OAuth authorization.
 *
 * @remarks
 * This error is thrown when an OAuth authorization request requires explicit
 * user consent but consent has not been granted. This typically occurs when:
 * - The client requests scopes that require consent
 * - The user has not previously granted consent for these scopes
 * - Consent has been revoked
 *
 * @example
 * ```typescript
 * // Thrown when consent is required
 * if (!hasConsent(clientId, userId, scopes)) {
 *   throw ConsentRequiredError.create();
 * }
 * ```
 */
export class ConsentRequiredError extends DomainError {
  readonly code: DomainErrorCode = 'AUTH_CORE_OAUTH.CONSENT_REQUIRED';
  readonly message = 'User consent is required for this OAuth authorization';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  /**
   * Creates a new ConsentRequiredError instance.
   *
   * @returns New ConsentRequiredError instance
   */
  public static create(): ConsentRequiredError {
    return new ConsentRequiredError(
      'User consent is required for this OAuth authorization',
      {},
    );
  }
}
