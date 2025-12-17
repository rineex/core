import z from 'zod';

import { InvalidValueObjectError } from '../errors/invalid-vo.error';
import { ValueObject } from '../base/vo';

type Props = string;

export class Url extends ValueObject<Props> {
  private static schema = z.url();

  public get href(): string {
    return this.value;
  }

  public static create(props: Props) {
    return new Url(props);
  }

  protected validate(value: Props): void {
    const result = Url.schema.safeParse(value);

    if (!result.success) {
      throw new InvalidValueObjectError(`Invalid URL: ${value}`);
    }
  }
}
