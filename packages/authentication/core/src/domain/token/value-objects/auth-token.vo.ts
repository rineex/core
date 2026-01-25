import { PrimitiveValueObject } from '@rineex/ddd';

import { InvalidAuthTokenError } from '@/domain/errors/invalid-auth-token.error';

/**
 * Represents a cryptographic authentication token.
 *
 * @remarks
 * This is a domain-level abstraction for authentication tokens. Important notes:
 * - This is NOT a JWT
 * - This is NOT a bearer string
 * - This is a domain-level proof of authentication
 * - Concrete formats (JWT, opaque tokens, etc.) live in adapters
 *
 * @example
 * ```typescript
 * class JwtAuthToken extends AuthToken {
 *   readonly type = 'JWT';
 *
 *   static fromString(value: string): JwtAuthToken {
 *     return new JwtAuthToken(value);
 *   }
 * }
 * ```
 */
export abstract class AuthToken extends PrimitiveValueObject<string> {
  /**
   * Token type identifier.
   * Used for routing to correct adapters and determining token format.
   *
   * @example
   * ```typescript
   * readonly type = 'JWT';
   * readonly type = 'OPAQUE';
   * ```
   */
  abstract readonly type: string;

  /**
   * Validates the token value.
   *
   * @param value - The token string to validate
   * @throws {InvalidAuthTokenError} If the token length is below the minimum required length
   */
  protected validate(value: string): void {
    if (value.length < 32) {
      throw InvalidAuthTokenError.create('Authentication token is invalid', {
        actualLength: value.length,
        minLength: 32,
      });
    }
  }
}
