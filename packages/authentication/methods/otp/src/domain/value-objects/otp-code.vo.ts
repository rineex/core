import { PrimitiveValueObject } from '@rineex/ddd';

/**
 * Represents a One-Time Password (OTP) code.
 *
 * @remarks
 * Security considerations:
 * - Fixed length (6 digits)
 * - Numeric-only by default
 * - Immutable value object
 *
 * @example
 * ```typescript
 * // Create an OTP code
 * const code = OtpCode.create('123456');
 *
 * // Access the value
 * const value = code.value; // '123456'
 * ```
 */
export class OtpCode extends PrimitiveValueObject<string> {
  /**
   * Creates a new OTP code instance.
   *
   * @param value - The 6-digit numeric string
   * @returns New OtpCode instance
   * @throws {Error} If the value is not a 6-digit numeric string
   */
  public static create(value: string): OtpCode {
    return new OtpCode(value);
  }

  /**
   * Validates the OTP code format.
   *
   * @param value - The OTP code string to validate
   * @throws {Error} If the value is not a 6-digit numeric string
   */
  protected validate(value: string): void {
    if (!/^\d{6}$/.test(value)) {
      throw new Error('OTP code must be a 6-digit numeric string');
    }
  }
}
