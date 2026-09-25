import { EntityValidationError } from '../errors/entity-validation.error';
import { PrimitiveValueObject } from '../base/primitive-vo';

export class Timestamp extends PrimitiveValueObject<number> {
  readonly __immutable = true as const;

  toDate(): Date {
    return new Date(this.value);
  }

  protected validate(value: unknown): void {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
      throw EntityValidationError.create(
        'Timestamp must be a non-negative integer',
        {},
      );
    }
  }
}
