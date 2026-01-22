import type { Tagged } from 'type-fest';
import { v4 } from 'uuid';
import z from 'zod';

import { InvalidValueObjectError } from '../errors/invalid-vo.error';
import { PrimitiveValueObject } from '../base/primitive-vo';

/**
 * UUID is a branded string type.
 *
 * - Prevents accidental use of arbitrary strings
 * - Requires explicit validation or construction
 * - Zero runtime cost after creation
 */

export type UuID = Tagged<string, 'UUID'>;

/**
 * Abstract base class for all domain identifiers.
 *
 * Responsibilities:
 * - Enforces that every DomainID wraps a primitive string value.
 * - Provides a type-safe static factory `fromString` for creating concrete IDs.
 * - Leaves domain-specific validation to subclasses via `validate`.
 *
 * Design Notes:
 * - The class cannot know how to validate the ID itself, because validation
 *   rules differ between ID types (e.g., UUID v4, ULID, NanoID).
 * - Static factory uses `new this(value)` pattern; hence, base class is **not abstract** in TypeScript terms.
 * - Subclasses must implement `validate(value: string)` inherited from PrimitiveValueObject.
 *
 * Usage:
 * ```ts
 * class AuthAttemptId extends DomainID {
 *   protected validate(value: string): void {
 *     if (!isValidUuid(value)) {
 *       throw new Error('Invalid AuthAttemptId');
 *     }
 *   }
 * }
 *
 * const id = AuthAttemptId.fromString('550e8400-e29b-41d4-a716-446655440000');
 * ```
 */
export abstract class DomainID extends PrimitiveValueObject<UuID> {
  public static schema = z.uuid();

  public constructor(value: string) {
    super(value as UuID);
  }

  /**
   * Creates a concrete DomainID from a trusted string value.
   *
   * - Validation is enforced in the subclass constructor.
   * - Intended for application or infrastructure layers to produce IDs.
   *
   * @template T - Concrete subclass of DomainID
   * @param this - The constructor of the concrete subclass
   * @param value - Raw string value of the ID
   * @returns Instance of the concrete DomainID subclass
   */
  public static fromString<T extends new (value: string) => DomainID>(
    this: T,
    value: string,
  ): InstanceType<T> {
    return new this(value) as InstanceType<T>;
  }

  public static generate<T extends new (value: string) => DomainID>(
    this: T,
  ): InstanceType<T> {
    return new this(v4()) as InstanceType<T>;
  }

  protected validate(value: UuID): void {
    const result = DomainID.schema.safeParse(value);

    if (!result.success) {
      throw InvalidValueObjectError.create(`Invalid UUID: ${value}`);
    }
  }
}
