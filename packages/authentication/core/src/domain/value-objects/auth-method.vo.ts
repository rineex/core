import { PrimitiveValueObject } from '@rineex/ddd';

/**
 * Represents the authentication method requested or used.
 *
 * Examples:
 * - passwordless
 * - otp
 * - oauth
 * - oidc
 * - passkey
 *
 * This is a value object, NOT a strategy.
 */
export class AuthMethod extends PrimitiveValueObject<string> {
  protected validate(value: string): void {
    if (!value) {
      throw new Error('AuthMethod cannot be empty');
    }
  }
}
