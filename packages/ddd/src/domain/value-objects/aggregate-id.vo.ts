import { v4 } from 'uuid';
import z from 'zod';

import { InvalidValueObjectError } from '../errors/invalid-vo.error';
import { ValueObject } from '../base/vo';

/**
 * AggregateId is a ValueObject that represents a unique identifier for an aggregate.
 */
export class AggregateId extends ValueObject<string> {
  /**
   * The schema for the AggregateId
   */
  private static readonly schema = z.uuid();

  /**
   * Get the UUID of the AggregateId
   * @returns The UUID of the AggregateId
   */
  public get uuid(): string {
    return this.value;
  }

  /**
   * Create a new AggregateId
   * @param value The value to create the AggregateId from
   * @returns The new AggregateId
   */
  public static create(value: string): AggregateId {
    return new AggregateId(value);
  }

  /**
   * Create a new AggregateId with a random UUID v4
   */
  public static generate(): AggregateId {
    return new AggregateId(v4());
  }

  /**
   * Check if the AggregateId is empty
   * @returns True if the AggregateId is empty, false otherwise
   */
  public isEmpty(): boolean {
    return !this.value;
  }

  /**
   * Convert the AggregateId to a string
   * @returns The string representation of the AggregateId
   */
  public toString(): string {
    return this.value;
  }

  /**
   * Validate the AggregateId
   * @param value The value to validate
   * @throws InvalidValueObjectException if the value is invalid
   */
  protected validate(value: string): void {
    const result = AggregateId.schema.safeParse(value);

    if (!result.success) {
      throw new InvalidValueObjectError(
        `Invalid AggregateId: ${result.error.message}`,
      );
    }
  }
}
