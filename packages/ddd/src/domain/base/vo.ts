import deepEqual from 'fast-deep-equal/es6';

import { deepFreeze } from '@/utils/deep-freeze.util';

export abstract class ValueObject<T> {
  get value(): T {
    return this.props;
  }

  protected readonly props: Readonly<T>;

  protected constructor(props: T) {
    this.validate(props);
    this.props = deepFreeze(props);
  }

  /**
   * Type guard to check if an unknown object is an instance of ValueObject.
   * This is useful for runtime type checking.
   *
   * @param vo The object to check.
   * @returns True if the object is a ValueObject instance, false otherwise.
   */
  public static is(vo: unknown): vo is ValueObject<unknown> {
    return vo instanceof ValueObject;
  }

  /**
   * Deep equality comparison of ValueObjects
   */
  public equals(other?: ValueObject<T>): boolean {
    if (other === null || other === undefined) return false;

    // Check if they share the same constructor (Type check)
    if (Object.getPrototypeOf(this) !== Object.getPrototypeOf(other)) {
      return false;
    }

    return deepEqual(this.props, other.props);
  }

  /**
   * Standard for clean API integration and logging.
   */
  public toJSON(): T {
    return this.props;
  }

  /**
   * Useful for debugging and string-based indexing.
   */
  public toString(): string {
    return JSON.stringify(this.props);
  }

  /**
   * Validates the value object props
   * @throws InvalidValueObjectError if validation fails
   */
  protected abstract validate(props: T): void;
}
