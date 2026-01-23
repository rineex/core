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
  protected validate(value: string): void {
    if (!value || value.length < 4) {
      throw InvalidValueObjectError.create('Invalid challenge secret');
    }
  }

  public static create(value: string): ChallengeSecret {
    return new ChallengeSecret(value);
  }
}
