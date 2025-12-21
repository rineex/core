import { v4 } from 'uuid';
import z from 'zod';

import { InvalidValueObjectError } from '../errors/invalid-vo.error';
import { PrimitiveValueObject } from '../base/primitive-vo';

/**
 * Represents a UUID (Universally Unique Identifier) value object.
 *
 * This class extends PrimitiveValueObject to provide type-safe UUID handling
 * with validation using Zod schema. UUIDs are immutable and can be generated
 * randomly or created from string values.
 *
 * @example
 * // Generate a new random UUID
 * const id = UUID.generate();
 *
 * @example
 * // Create UUID from an existing string
 * const id = UUID.fromString('550e8400-e29b-41d4-a716-446655440000');
 *
 * @throws {InvalidValueObjectError} When the provided string is not a valid UUID format
 */
export class UUID extends PrimitiveValueObject<string> {
  private static readonly schema = z.uuid();

  /**
   * Generates a new AggregateId.
   */
  public static generate(): UUID {
    return new UUID(v4());
  }

  /**
   * Creates an UUID from an external string.
   * Use only for untrusted input.
   *
   * @param value - UUID string
   */
  public static fromString(value: string): UUID {
    return new UUID(value);
  }

  protected validate(value: string): void {
    const result = UUID.schema.safeParse(value);

    if (!result.success) {
      throw new InvalidValueObjectError(
        `Invalid UUID: ${result.error.message}`,
      );
    }
  }
}
