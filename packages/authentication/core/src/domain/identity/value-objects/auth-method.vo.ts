import { InvalidValueObjectError, PrimitiveValueObject } from '@rineex/ddd';

import { AuthMethodName } from '@/types/auth-method.type';

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
      throw InvalidValueObjectError.create('AuthMethod cannot be empty');
    }
  }
}
