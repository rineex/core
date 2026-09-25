import { EntityIdPrimitive } from '../types/value-object-like.type';
import { ImmutableBrand } from '../types/immutable-brand.type';
import { EntityId } from '../types';

/**
 * Base class for primitive-based Value Objects.
 *
 * This class is intended for Value Objects that are represented by
 * a single primitive value (string, number, or boolean).
 *
 * Characteristics:
 * - Immutable by construction
 * - Cheap equality comparison
 * - No deep cloning or freezing
 * - Safe for serialization and logging
 *
 * Examples:
 * - AggregateId
 * - EmailAddress
 * - Username
 * - Slug
 */
export abstract class PrimitiveValueObject<T extends EntityIdPrimitive>
  implements EntityId, ImmutableBrand
{
  readonly __immutable = true as const;
  /**
   * The underlying primitive value.
   * Guaranteed to be valid after construction.
   */
  get value(): T {
    return this.#value;
  }

  readonly #value: Readonly<T>;

  /**
   * Constructs a new PrimitiveValueObject.
   *
   * @param value - The primitive value to wrap
   * @throws Error if validation fails
   */
  protected constructor(value: T) {
    this.validate(value);
    this.#value = value;
  }

  /**
   * Compares two Value Objects for equality.
   *
   * Equality rules:
   * - Same concrete class
   * - Same primitive value (===)
   *
   * @param other - Another Value Object
   */
  public equals(other: unknown): boolean {
    if (other == null) return false;

    if (Object.getPrototypeOf(this) !== Object.getPrototypeOf(other)) {
      return false;
    }

    if (!(other instanceof PrimitiveValueObject)) return false;

    return this.#value === other.#value;
  }

  public toJSON(): T {
    return this.#value;
  }

  /**
   * String representation.
   * Useful for logging and debugging.
   */
  public toString(): string {
    return String(this.#value);
  }

  /**
   * Domain invariant validation.
   * Must throw if the value is invalid.
   *
   * @param value - The value to validate
   */
  protected abstract validate(value: T): void;
}
