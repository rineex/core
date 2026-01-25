import { PrimitiveValueObject } from '@rineex/ddd';

/**
 * OTP code for passwordless login.
 * 6-digit numeric code.
 */
export class OtpCode extends PrimitiveValueObject<string> {
  /**
   * Creates a new OtpCode value object.
   *
   * @param {string} val - The OTP code value (must be 6 digits)
   * @returns {OtpCode} A new OtpCode instance
   * @throws {Error} If the value is not a valid 6-digit code
   */
  public static create(val: string): OtpCode {
    return new OtpCode(val);
  }

  /**
   * Validates the OTP code value.
   *
   * @param {string} value - The value to validate
   * @throws {Error} If the value is not exactly 6 digits
   */
  protected validate(value: string): void {
    if (!/^\d{6}$/.test(value)) {
      throw new Error(`Invalid OTP code: ${value}`);
    }
  }
}
