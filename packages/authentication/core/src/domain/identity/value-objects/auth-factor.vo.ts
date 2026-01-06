import { AuthFactorName } from '@/types/auth-factor.type';
import { PrimitiveValueObject } from '@rineex/ddd';

/**
 * Represents an authentication factor.
 */
export class AuthFactor extends PrimitiveValueObject<AuthFactorName> {
  protected validate(value: AuthFactorName): void {
    if (!value) {
      throw new Error('AuthFactor must be a valid identifier');
    }
  }

  public static create(value: AuthFactorName): AuthFactor {
    return new AuthFactor(value);
  }
}
