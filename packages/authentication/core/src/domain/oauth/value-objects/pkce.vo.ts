import { ValueObject } from '@rineex/ddd';

import { InvalidPkceViolation } from '../violations/invalid-pkce.violation';

export type PkceProps = {
  readonly codeVerifier: string;
  readonly codeChallenge: string;
  readonly method: 'plain' | 'S256';
};

export class Pkce extends ValueObject<PkceProps> {
  public static create(props: PkceProps): Pkce {
    return new Pkce(props);
  }

  public static fromJSON(json: Record<string, unknown>): Pkce {
    return new Pkce({
      codeChallenge: json.codeChallenge as string,
      codeVerifier: json.codeVerifier as string,
      method: json.method as 'plain' | 'S256',
    });
  }

  protected validate(props: PkceProps): void {
    if (!props.codeVerifier || !props.codeChallenge) {
      throw InvalidPkceViolation.create(props);
    }
  }
}
