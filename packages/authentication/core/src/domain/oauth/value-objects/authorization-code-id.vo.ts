import { PrimitiveValueObject } from '@rineex/ddd';

export class AuthorizationCodeId extends PrimitiveValueObject<string> {
  protected validate(value: string): void {
    if (!value || value.length < 32) {
      throw new Error('Invalid authorization code');
    }
  }
}
