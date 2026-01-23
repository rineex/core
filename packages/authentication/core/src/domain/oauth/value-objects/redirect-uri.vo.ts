import { PrimitiveValueObject } from '@rineex/ddd';

import { InvalidRedirectUriViolation } from '../violations/invalid-redirect-uri.violation';

export class RedirectUri extends PrimitiveValueObject<string> {
  protected validate(url: string): void {
    let parsed: URL;

    try {
      parsed = new URL(url);
    } catch {
      throw InvalidRedirectUriViolation.create({ redirectUri: url });
    }

    if (parsed.protocol !== 'https:' || parsed.hash) {
      throw InvalidRedirectUriViolation.create({ redirectUri: url });
    }
  }
}
