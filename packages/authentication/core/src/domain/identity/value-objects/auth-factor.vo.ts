import { PrimitiveValueObject } from '@rineex/ddd';

import { AuthFactorName } from '@/types/auth-factor.type';

/**
 * Represents an authentication factor.
 */
export class AuthFactor extends PrimitiveValueObject<AuthFactorName> {
  public static create(value: AuthFactorName): AuthFactor {
    return new AuthFactor(value);
  }

  protected validate(value: AuthFactorName): void {
    if (!value) {
      throw new Error('AuthFactor must be a valid identifier');
    }
  }
}
