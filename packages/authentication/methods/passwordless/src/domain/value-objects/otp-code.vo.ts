import { PrimitiveValueObject } from '@rineex/ddd';

/**
 * OTP code for passwordless login.
 * 6-digit numeric code.
 */
export class OtpCode extends PrimitiveValueObject<string> {
  protected validate(value: string): void {
    if (!/^\d{6}$/.test(value)) {
      throw new Error(`Invalid OTP code: ${value}`);
    }
  }

  public static create(val: string): OtpCode {
    return new OtpCode(val);
  }
}
