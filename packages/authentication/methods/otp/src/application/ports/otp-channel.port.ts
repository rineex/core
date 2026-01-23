import { OtpCode } from '@/domain/value-objects/otp-code.vo';
import { IdentityId } from '@rineex/auth-core';

/**
 * Outbound port for OTP delivery and verification.
 *
 * Implementations may use:
 * - SMS
 * - Email
 * - Push
 * - Voice
 */
export type OtpChannelPort = {
  /**
   * Sends an OTP code to the given identity.
   */
  sendOtp: (identityId: IdentityId, code: OtpCode) => Promise<void>;

  /**
   * Verifies a user-provided OTP code.
   */
  verifyOtp: (identityId: IdentityId, code: OtpCode) => Promise<boolean>;
};
