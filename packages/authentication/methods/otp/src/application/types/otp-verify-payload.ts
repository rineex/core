import { IdentityId } from '@rineex/auth-core';

/**
 * Payload contract for verifying an OTP submission.
 */
export type OtpVerifyPayload = {
  readonly identityId: IdentityId;
  readonly code: string;
};
