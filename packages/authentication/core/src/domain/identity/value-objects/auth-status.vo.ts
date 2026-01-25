import { InvalidValueObjectError, PrimitiveValueObject } from '@rineex/ddd';

const allowed = ['pending', 'succeed', 'failed'] as const;

/**
 * All supported authentication lifecycle states.
 *
 * This union is intentionally closed.
 * New states require explicit domain design.
 */
export type AuthStatusType = (typeof allowed)[number];

/**
 * Represents the lifecycle state of an authentication attempt.
 *
 * This is intentionally restrictive to avoid invalid transitions.
 */
export class AuthStatus extends PrimitiveValueObject<AuthStatusType> {
  /**
   * Make sure auth is not finished
   */
  public get isFinal(): boolean {
    // return this.isNot('pending);
    return this.is('succeed') || this.is('failed');
  }

  static create(value: AuthStatusType): AuthStatus {
    return new AuthStatus(value);
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

  protected validate(value: AuthStatusType): void {
    if (!allowed.includes(value)) {
      throw InvalidValueObjectError.create(`Invalid AuthStatus: ${value}`);
    }
  }
}
