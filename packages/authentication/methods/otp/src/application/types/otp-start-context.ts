import { IdentityId } from '@rineex/auth-core';

/**
 * Input contract for starting an OTP authentication flow.
 *
 * Owned by the OTP method, opaque to auth-core, validated inside the method.
 */
export type OtpStartContext = {
  readonly identityId: IdentityId;
};
