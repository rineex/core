import { AuthPolicyName } from '@/types/auth-policy.type';
import { PrimitiveValueObject } from '@rineex/ddd';

/**
 * Represents a policy applied during authentication orchestration.
 *
 * Policies influence decisions but do not authenticate users.
 */
export class AuthPolicy extends PrimitiveValueObject<AuthPolicyName> {
  public static create(value: AuthPolicyName): AuthPolicy {
    return new AuthPolicy(value);
  }

  protected validate(value: AuthPolicyName): void {
    if (!value) {
      throw new Error('AuthPolicy must be a valid identifier');
    }
  }
}
