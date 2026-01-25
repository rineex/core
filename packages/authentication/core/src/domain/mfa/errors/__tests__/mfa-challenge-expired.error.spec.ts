import { describe, expect, it } from 'vitest';

import { MfaChallengeExpiredError } from '../mfa-challenge-expired.error';

describe('mfaChallengeExpiredError', () => {
  it('should create an error with default message', () => {
    const error = MfaChallengeExpiredError.create();

    expect(error).toBeInstanceOf(MfaChallengeExpiredError);
    expect(error.message).toBe('MFA challenge has expired');
    expect(error.code).toBe('AUTH_CORE_MFA.CHALLENGE_EXPIRED');
    expect(error.type).toBe('DOMAIN.INVALID_STATE');
  });

  it('should serialize to object correctly', () => {
    const error = MfaChallengeExpiredError.create();

    const serialized = error.toObject();

    expect(serialized).toEqual({
      code: 'AUTH_CORE_MFA.CHALLENGE_EXPIRED',
      message: 'MFA challenge has expired',
      type: 'DOMAIN.INVALID_STATE',
      metadata: {},
    });
  });

  it('should convert to string correctly', () => {
    const error = MfaChallengeExpiredError.create();

    expect(error.toString()).toBe(
      '[AUTH_CORE_MFA.CHALLENGE_EXPIRED] MFA challenge has expired',
    );
  });
});
