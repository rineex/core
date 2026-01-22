import z from 'zod';

import { InvalidValueObjectError } from '../errors/invalid-vo.error';
import { PrimitiveValueObject } from '../base/primitive-vo';

export class Email extends PrimitiveValueObject<string> {
  private static readonly schema = z.email();

  public constructor(value: string) {
    super(value);
    this.validate(value);
  }

  public static fromString(value: string): Email {
    return new this(value);
  }

  protected validate(value: string): void {
    const result = Email.schema.safeParse(value);

    if (!result.success) {
      throw InvalidValueObjectError.create(
        `Invalid ${this.constructor.name}: ${value}`,
        {
          value,
        },
      );
    }
  }
}
