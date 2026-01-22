import z from 'zod';

import { InvalidValueObjectError } from '../errors/invalid-vo.error';
import { ValueObject } from '../base/vo';

type URLStr = string;

export class Url extends ValueObject<URLStr> {
  private static schema = z.url();

  public get href(): string {
    return this.value;
  }

  public static create(props: URLStr) {
    return new Url(props);
  }

  protected validate(value: URLStr): void {
    const result = Url.schema.safeParse(value);

    if (!result.success) {
      throw InvalidValueObjectError.create(`Invalid URL: ${value}`, { value });
    }
  }
}
