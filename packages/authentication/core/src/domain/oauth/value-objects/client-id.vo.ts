import { PrimitiveValueObject } from '@rineex/ddd';

export class ClientId extends PrimitiveValueObject<string> {
  public static create(value: string): ClientId {
    return new ClientId(value);
  }

  protected validate(value: string): void {
    if (!value || value.length < 8) {
      throw new Error('Invalid client identifier');
    }
  }
}
