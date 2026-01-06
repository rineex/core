import {
  AuthContext,
  AuthMethod,
  AuthMethodPort,
  IdentityId,
} from '@rineex/auth-core';
import { OtpAuthenticationViolation } from '@/domain/violations/otp-authentication.violation';
import { OtpCode } from '@/domain/value-objects/otp-code.vo';

import { OtpChannelPort } from './ports/otp-channel.port';

/**
 * OTP authentication method implementation.
 *
 * This class:
 * - Implements AuthMethodPort
 * - Does not manage persistence
 * - Does not generate HTTP responses
 * - Delegates delivery & verification
 */
export class OtpAuthMethod implements AuthMethodPort {
  public readonly method = AuthMethod.create('otp');

  constructor(
    private readonly otpChannel: OtpChannelPort,
    private readonly otpGenerator: () => OtpCode,
  ) {}

  async authenticate(context: AuthContext) {
    if (!context || !context.metadata?.identityId) {
      throw new OtpAuthenticationViolation(
        'Identity ID is required in context metadata',
      );
    }

    const identityId = context.metadata.identityId as IdentityId;

    const otp = this.otpGenerator();

    await this.otpChannel.sendOtp(identityId, otp);
  }

  /**
   * Verifies the OTP code submitted by the user.
   *
   * This is intentionally separate from authenticate()
   * to support async & multi-step flows.
   */
  async verify(identityId: IdentityId, rawCode: string): Promise<void> {
    const code = OtpCode.create(rawCode);

    const valid = await this.otpChannel.verifyOtp(identityId, code);

    if (!valid) {
      throw new OtpAuthenticationViolation();
    }
  }
}
