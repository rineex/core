import { PrimitiveValueObject } from '@rineex/ddd';

/**
 * Type representing valid passwordless challenge status values.
 */
export type PasswordlessChallengeStatusType = 'expired' | 'issued' | 'verified';

/**
 * Value object representing the status of a passwordless challenge.
 *
 * Possible statuses:
 * - issued: Challenge has been created and issued
 * - verified: Challenge has been successfully verified
 * - expired: Challenge has expired and can no longer be used
 */
export class PasswordlessChallengeStatus extends PrimitiveValueObject<PasswordlessChallengeStatusType> {
  /**
   * Creates a status representing an expired challenge.
   *
   * @returns {PasswordlessChallengeStatus} An expired status instance
   */
  public static expired(): PasswordlessChallengeStatus {
    return new PasswordlessChallengeStatus('expired');
  }

  /**
   * Creates a status representing an issued challenge.
   *
   * @returns {PasswordlessChallengeStatus} An issued status instance
   */
  public static issued(): PasswordlessChallengeStatus {
    return new PasswordlessChallengeStatus('issued');
  }

  /**
   * Creates a status representing a verified challenge.
   *
   * @returns {PasswordlessChallengeStatus} A verified status instance
   */
  public static verified(): PasswordlessChallengeStatus {
    return new PasswordlessChallengeStatus('verified');
  }

  /**
   * Checks if the status is in a final state (cannot be changed).
   *
   * Final states are 'verified' and 'expired'.
   *
   * @returns {boolean} True if the status is final, false otherwise
   */
  public isFinal(): boolean {
    return this.value === 'verified' || this.value === 'expired';
  }

  /**
   * Validates the status value.
   *
   * @param {PasswordlessChallengeStatusType} _value - The value to validate
   * @remarks This is a closed union type, so no runtime validation is needed
   */
  protected validate(_value: PasswordlessChallengeStatusType): void {
    // closed union, no runtime validation needed
  }
}
