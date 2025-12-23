import { PrimitiveValueObject } from '@rineex/ddd';

type AuthStatusType = 'FAILED' | 'PENDING' | 'SUCCEEDED';

/**
 * Represents the lifecycle state of an authentication attempt.
 *
 * This is intentionally restrictive to avoid invalid transitions.
 */
export class AuthStatus extends PrimitiveValueObject<AuthStatusType> {
  protected validate(value: AuthStatusType): void {
    if (!['FAILED', 'PENDING', 'SUCCEEDED'].includes(value)) {
      throw new Error(`Invalid AuthStatus: ${value}`);
    }
  }

  /**
   * Checks if the current auth status matches the provided value.
   * @param value - The auth status type to compare against
   * @returns True if the current status matches the provided value, false otherwise
   */
  public is(value: AuthStatusType): boolean {
    return this.value === value;
  }

  /**
   * Checks if the current authentication status is not equal to the provided value.
   * @param value - The authentication status type to compare against
   * @returns True if the current status differs from the provided value, false otherwise
   */
  public isNot(value: AuthStatusType): boolean {
    return this.value !== value;
  }

  static create(value: AuthStatusType): AuthStatus {
    return new AuthStatus(value);
  }
}
