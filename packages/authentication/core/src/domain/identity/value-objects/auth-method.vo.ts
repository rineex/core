import { AuthMethodName } from '@/types/auth-method.type';
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
export class AuthMethod extends PrimitiveValueObject<AuthMethodName> {
  public static create(value: AuthMethodName): AuthMethod {
    return new AuthMethod(value);
  }

  public is(method: AuthMethodName): boolean {
    return this.value === method;
  }

  public isNot(method: AuthMethodName): boolean {
    return this.value !== method;
  }

  protected validate(value: AuthMethodName): void {
    if (!value) {
      throw new Error('AuthMethod cannot be empty');
    }
  }
}
