import { DomainError, Metadata } from '@rineex/ddd';

type Props = Metadata<Record<string, unknown>>;

/**
 * Raised when PKCE (Proof Key for Code Exchange) parameters are invalid.
 *
 * @remarks
 * This error is thrown when PKCE validation fails:
 * - Code verifier format is invalid
 * - Code challenge doesn't match code verifier
 * - Code challenge method is unsupported
 * - PKCE parameters are missing when required
 *
 * @example
 * ```typescript
 * // Thrown when PKCE validation fails
 * throw InvalidPkceError.create({ reason: 'code_verifier_mismatch' });
 * ```
 */
export class InvalidPkceError extends DomainError<
  'AUTH_CORE_OAUTH.INVALID_PKCE',
  Props
> {
  readonly code = 'AUTH_CORE_OAUTH.INVALID_PKCE' as const;
  readonly message = 'PKCE parameters are invalid';

  /**
   * Creates a new InvalidPkceError instance.
   *
   * @param details - Optional metadata about the PKCE validation failure
   * @returns New InvalidPkceError instance
   */
  public static create(details?: Record<string, unknown>): InvalidPkceError {
    return new InvalidPkceError('PKCE parameters are invalid', details ?? {});
  }
}
