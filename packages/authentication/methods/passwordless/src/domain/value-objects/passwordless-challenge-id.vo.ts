import { InvalidValueObjectError, PrimitiveValueObject } from '@rineex/ddd';

/**
 * Unique ID for passwordless login session.
 */
export class PasswordlessChallengeId extends PrimitiveValueObject<string> {
  public static create(value: string): PasswordlessChallengeId {
    return new PasswordlessChallengeId(value);
  }

  protected validate(value: string): void {
    if (!value)
      throw InvalidValueObjectError.create('Session ID cannot be empty', {
        value,
      });
  }
}
