import { PrimitiveValueObject } from '@rineex/ddd';

import { InvalidAuthorizationCodeError } from '../errors/invalid-authorization-code.error';

export class AuthorizationCode extends PrimitiveValueObject<string> {
  public static create(value: string): AuthorizationCode {
    return new AuthorizationCode(value);
  }

  protected validate(value: string): void {
    if (value.length < 8) {
      throw InvalidAuthorizationCodeError.create({
        actualLength: value.length,
        minLength: 8,
      });
    }
  }
}
