import { InvalidAuthTokenViolation } from '@/domain/violations/invalid-auth-token.violation';
import { PrimitiveValueObject } from '@rineex/ddd';

/**
 * Represents a cryptographic authentication token.
 *
 * IMPORTANT:
 * - This is NOT a JWT
 * - This is NOT a bearer string
 * - This is a domain-level proof of authentication
 *
 * Concrete formats live in adapters.
 */
export abstract class AuthToken extends PrimitiveValueObject<string> {
  /**
   * Token type identifier.
   * Used for routing to correct adapters.
   */
  abstract readonly type: string;

  protected validate(value: string): void {
    if (value.length < 32) {
      throw InvalidAuthTokenViolation.create({
        actualLength: value.length,
        minLength: 32,
      });
    }
  }
}
