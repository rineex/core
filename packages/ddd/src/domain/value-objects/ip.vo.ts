import z from 'zod';

import { InvalidValueObjectError } from '@/domain/errors/invalid-vo.error';

import { PrimitiveValueObject } from '../base/primitive-vo';

/**
 * Props type for {@link IPAddress}.
 *
 * Represents the raw string value of an IP address.
 * The value MUST be a valid IPv4 or IPv6 address.
 */
type Props = string;

/**
 * IPAddress Value Object.
 *
 * Represents an immutable IP address within the domain.
 * This value object guarantees that the contained value
 * is always a valid IPv4 or IPv6 address.
 *
 * Invariants:
 * - Value MUST be a valid IPv4 or IPv6 string.
 *
 * Validation is performed at creation time and any invalid
 * value will result in an {@link InvalidValueObjectError}.
 */
export class IPAddress extends PrimitiveValueObject<Props> {
  /**
   * Zod schema used to validate IPv4 and IPv6 addresses.
   */
  private static schema = z.union([z.ipv4(), z.ipv6()]);

  /**
   * Factory method for creating an {@link IPAddress}.
   *
   * @param value - Raw IP address string.
   * @returns A valid {@link IPAddress} instance.
   *
   * @throws {InvalidValueObjectError}
   * Thrown when the provided value is not a valid IPv4 or IPv6 address.
   */
  public static create(value: Props) {
    return new IPAddress(value);
  }

  /**
   * Validates the IP address value against the defined schema.
   *
   * @param value - Raw IP address string to validate.
   *
   * @throws {InvalidValueObjectError}
   * Thrown when the value does not represent a valid IPv4 or IPv6 address.
   */
  protected validate(value: Props): void {
    const result = IPAddress.schema.safeParse(value);

    if (!result.success) {
      throw InvalidValueObjectError.create(`Invalid IP Address: ${value}`);
    }
  }
}
