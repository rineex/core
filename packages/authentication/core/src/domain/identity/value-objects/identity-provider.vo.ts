import { IdentityProviderName } from '@/types/identity-provider.type';
import { PrimitiveValueObject } from '@rineex/ddd';

/**
 * Represents an external or internal identity provider.
 */
export class IdentityProvider extends PrimitiveValueObject<IdentityProviderName> {
  protected validate(value: IdentityProviderName): void {
    if (!value) {
      throw new Error('IdentityProvider must be a valid identifier');
    }
  }
}
