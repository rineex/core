import { describe, expect, it } from 'vitest';

import { OtpCode } from '../otp-code.vo';

describe('otpCode', () => {
  describe('create', () => {
    it('should create a valid 6-digit OTP code', () => {
      const otp = OtpCode.create('123456');

      expect(otp).toBeInstanceOf(OtpCode);
      expect(otp.value).toBe('123456');
    });

    it('should create a valid OTP code with leading zeros', () => {
      const otp = OtpCode.create('000123');

      expect(otp).toBeInstanceOf(OtpCode);
      expect(otp.value).toBe('000123');
    });

    it('should create a valid OTP code with all zeros', () => {
      const otp = OtpCode.create('000000');

      expect(otp).toBeInstanceOf(OtpCode);
      expect(otp.value).toBe('000000');
    });

    it('should throw Error for non-6-digit code', () => {
      expect(() => {
        OtpCode.create('12345');
      }).toThrow(/Invalid OTP code: 12345/);

      expect(() => {
        OtpCode.create('1234567');
      }).toThrow(/Invalid OTP code: 1234567/);
    });

    it('should throw Error for non-numeric code', () => {
      expect(() => {
        OtpCode.create('abcdef');
      }).toThrow(/Invalid OTP code: abcdef/);

      expect(() => {
        OtpCode.create('12345a');
      }).toThrow(/Invalid OTP code: 12345a/);
    });

    it('should throw Error for empty string', () => {
      expect(() => {
        OtpCode.create('');
      }).toThrow(/Invalid OTP code/);
    });

    it('should throw Error for code with spaces', () => {
      expect(() => {
        OtpCode.create('123 456');
      }).toThrow(/Invalid OTP code: 123 456/);
    });

    it('should throw Error for code with special characters', () => {
      expect(() => {
        OtpCode.create('123-45');
      }).toThrow(/Invalid OTP code: 123-45/);
    });
  });

  describe('value', () => {
    it('should return the OTP code value', () => {
      const otp = OtpCode.create('123456');

      expect(otp.value).toBe('123456');
    });
  });
});
