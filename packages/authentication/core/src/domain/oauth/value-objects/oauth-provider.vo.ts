import { PrimitiveValueObject } from '@rineex/ddd';

import { InvalidOAuthProviderError } from '../errors/invalid-oauth-provider.error';

export class OAuthProvider extends PrimitiveValueObject<string> {
  public static create(value: string): OAuthProvider {
    return new OAuthProvider(value);
  }

  protected validate(value: string): void {
    if (!value || value.length < 2) {
      throw InvalidOAuthProviderError.create({ value });
    }
  }
}
