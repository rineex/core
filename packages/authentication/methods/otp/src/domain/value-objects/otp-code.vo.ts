import { PrimitiveValueObject } from '@rineex/ddd';

/**
 * One-Time Password value object.
 *
 * Security considerations:
 * - Fixed length
 * - Numeric-only by default
 * - Immutable
 */
export class OtpCode extends PrimitiveValueObject<string> {
  protected validate(value: string): void {
    if (!/^\d{6}$/.test(value)) {
      throw new Error('OTP code must be a 6-digit numeric string');
    }
  }

  public static create(value: string): OtpCode {
    return new OtpCode(value);
  }
}
