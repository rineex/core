import { PrimitiveValueObject } from '@rineex/ddd';

import { InvalidAuthorizationCodeViolation } from '../violations/invalid-authorization-code.violation';

export class AuthorizationCode extends PrimitiveValueObject<string> {
  protected validate(value: string): void {
    if (value.length < 8) {
      throw InvalidAuthorizationCodeViolation.create({
        actualLength: value.length,
        minLength: 8,
      });
    }
  }

  public static create(value: string): AuthorizationCode {
    return new AuthorizationCode(value);
  }
}
