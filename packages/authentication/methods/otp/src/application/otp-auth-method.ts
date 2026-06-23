import {
  AuthAttemptId,
  AuthMethodName,
  AuthMethodOutcome,
  AuthMethodPort,
  IdentityId,
} from '@rineex/auth-core';

import { OtpAuthenticationError } from '@/domain/errors/otp-authentication.error';
import { OtpCode } from '@/domain/value-objects/otp-code.vo';

import { OtpChannelPort } from './ports/otp-channel.port';
import { OtpStartContext } from './types/otp-start-context';
import { OtpVerifyPayload } from './types/otp-verify-payload';

/**
 * OTP authentication method implementation.
 *
 * Implements {@link AuthMethodPort} and delegates delivery and verification
 * to {@link OtpChannelPort}.
 */
export class OtpAuthMethod implements AuthMethodPort {
  public readonly method: AuthMethodName = 'otp';

  constructor(
    private readonly otpChannel: OtpChannelPort,
    private readonly otpGenerator: () => OtpCode,
  ) {}

  async start({
    ctx,
  }: {
    authAttemptId: AuthAttemptId;
    ctx: unknown;
  }): Promise<AuthMethodOutcome> {
    const identityId = this.extractIdentityId(ctx);

    if (!identityId) {
      return {
        ok: false,
        violation: OtpAuthenticationError.create('Invalid OTP start context', {
          reason: 'Identity ID is required in context',
        }),
      };
    }

    const otp = this.otpGenerator();

    await this.otpChannel.sendOtp(identityId, otp);

    return { ok: true };
  }

  async verify({
    payload,
  }: {
    authAttemptId: AuthAttemptId;
    payload: unknown;
  }): Promise<AuthMethodOutcome> {
    const parsed = this.parseVerifyPayload(payload);

    if (!parsed) {
      return {
        ok: false,
        violation: OtpAuthenticationError.create('Invalid OTP verify payload', {
          reason: 'identityId and code are required',
        }),
      };
    }

    let code: OtpCode;

    try {
      code = OtpCode.create(parsed.code);
    } catch {
      return {
        ok: false,
        violation: OtpAuthenticationError.create(),
      };
    }

    const valid = await this.otpChannel.verifyOtp(parsed.identityId, code);

    if (!valid) {
      return {
        ok: false,
        violation: OtpAuthenticationError.create(),
      };
    }

    return { ok: true };
  }

  private extractIdentityId(ctx: unknown): IdentityId | null {
    if (!ctx || typeof ctx !== 'object') {
      return null;
    }

    if ('identityId' in ctx) {
      const { identityId } = ctx as OtpStartContext;

      if (identityId instanceof IdentityId) {
        return identityId;
      }
    }

    if ('metadata' in ctx) {
      const metadata = (ctx as { metadata?: Record<string, unknown> }).metadata;

      if (metadata?.identityId instanceof IdentityId) {
        return metadata.identityId;
      }
    }

    return null;
  }

  private parseVerifyPayload(payload: unknown): OtpVerifyPayload | null {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const { identityId, code } = payload as Partial<OtpVerifyPayload>;

    if (!(identityId instanceof IdentityId) || typeof code !== 'string') {
      return null;
    }

    return { identityId, code };
  }
}
