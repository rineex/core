import { PrimitiveValueObject } from '@rineex/ddd';

import { InvalidRedirectUriError } from '../errors/invalid-redirect-uri.error';

export class RedirectUri extends PrimitiveValueObject<string> {
  protected validate(url: string): void {
    let parsed: URL;

    try {
      parsed = new URL(url);
    } catch {
      throw InvalidRedirectUriError.create({ redirectUri: url });
    }

    if (parsed.protocol !== 'https:' || parsed.hash) {
      throw InvalidRedirectUriError.create({ redirectUri: url });
    }
  }
}
