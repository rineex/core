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
  protected validate(value: string): void {
    if (!value || value.length < 3) {
      throw InvalidValueObjectError.create('Invalid challenge destination');
    }
  }

  public static create(value: string): ChallengeDestination {
    return new ChallengeDestination(value);
  }
}
