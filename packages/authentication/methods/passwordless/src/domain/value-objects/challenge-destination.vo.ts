import { InvalidValueObjectError, PrimitiveValueObject } from '@rineex/ddd';

/**
 * Destination where the passwordless challenge is delivered.
 *
 * Examples:
 * - Email address
 * - Phone number
 * - Push token
 * - Device identifier
 *
 * Validation is delegated to channel implementations.
 */
export class ChallengeDestination extends PrimitiveValueObject<string> {
  /**
   * Creates a new ChallengeDestination value object.
   *
   * @param {string} value - The destination value (e.g., email address, phone number)
   * @returns {ChallengeDestination} A new ChallengeDestination instance
   * @throws {InvalidValueObjectError} If the value is invalid
   */
  public static create(value: string): ChallengeDestination {
    return new ChallengeDestination(value);
  }

  /**
   * Validates the destination value.
   *
   * @param {string} value - The value to validate
   * @throws {InvalidValueObjectError} If the value is empty or less than 3 characters
   */
  protected validate(value: string): void {
    if (!value || value.length < 3) {
      throw InvalidValueObjectError.create('Invalid challenge destination');
    }
  }
}
