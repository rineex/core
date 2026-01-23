import { PrimitiveValueObject } from '@rineex/ddd';

import { InvalidOAuthProviderViolation } from '../violations/invalid-oauth-provider.violation';

export class OAuthProvider extends PrimitiveValueObject<string> {
  public static create(value: string): OAuthProvider {
    return new OAuthProvider(value);
  }

  protected validate(value: string): void {
    if (!value || value.length < 2) {
      throw InvalidOAuthProviderViolation.create({ value });
    }
  }
}
