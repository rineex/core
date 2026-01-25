import { InvalidValueObjectError, PrimitiveValueObject } from '@rineex/ddd';

/**
 * Secret generated for a passwordless challenge.
 *
 * This can be:
 * - OTP
 * - Push nonce
 * - Authenticator code seed
 */
export class ChallengeSecret extends PrimitiveValueObject<string> {
  /**
   * Creates a new ChallengeSecret value object.
   *
   * @param {string} value - The secret value (e.g., OTP code, push nonce)
   * @returns {ChallengeSecret} A new ChallengeSecret instance
   * @throws {InvalidValueObjectError} If the value is invalid
   */
  public static create(value: string): ChallengeSecret {
    return new ChallengeSecret(value);
  }

  /**
   * Validates the secret value.
   *
   * @param {string} value - The value to validate
   * @throws {InvalidValueObjectError} If the value is empty or less than 4 characters
   */
  protected validate(value: string): void {
    if (!value || value.length < 4) {
      throw InvalidValueObjectError.create('Invalid challenge secret');
    }
  }
}
