import z from 'zod';

import { InvalidValueObjectError } from '@/domain/errors/invalid-vo.error';
import { ValueObject } from '@/domain/base/vo';

type Props = string;

export class IPAddress extends ValueObject<Props> {
  private static schema = z.union([z.ipv4(), z.ipv6()]);

  public static create(value: Props) {
    return new IPAddress(value);
  }

  protected validate(value: Props): void {
    const result = IPAddress.schema.safeParse(value);

    if (!result.success) {
      throw InvalidValueObjectError.create(`Invalid IP Address: ${value}`);
    }
  }
}
