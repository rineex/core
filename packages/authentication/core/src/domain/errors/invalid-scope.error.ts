import {
  DomainError,
  DomainErrorCode,
  DomainErrorType,
  Metadata,
} from '@rineex/ddd';

type Scope = string;

type ExtraProps = { scope: Scope };

type M = Metadata<ExtraProps>;

/**
 * Raised when a scope format is invalid.
 *
 * @remarks
 * This error is thrown when OAuth scope validation fails.
 * Scopes must follow the OAuth 2.0 specification format.
 *
 * @example
 * ```typescript
 * // Thrown when scope format is invalid
 * throw InvalidScopeError.create(
 *   'Scope format is invalid',
 *   { scope: 'invalid scope format' }
 * );
 * ```
 */
export class InvalidScopeError extends DomainError<M> {
  public readonly code: DomainErrorCode = 'AUTH_CORE_SCOPE.INVALID';
  public readonly message = 'Scope format is invalid';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_VALUE';

  /**
   * Creates a new InvalidScopeError instance.
   *
   * @param message - Human-readable error message
   * @param meta - Metadata containing scope details
   * @returns New InvalidScopeError instance
   */
  public static create(message: string, meta: M): InvalidScopeError {
    return new InvalidScopeError(message, meta);
  }
}
