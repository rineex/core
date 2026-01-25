import { describe, expect, it } from 'vitest';

import { MfaAttemptsExceededError } from '../mfa-attempts-exceeded.error';

describe('mfaAttemptsExceededError', () => {
  it('should create an error with attempts metadata', () => {
    const error = MfaAttemptsExceededError.create(5, 3);

    expect(error).toBeInstanceOf(MfaAttemptsExceededError);
    expect(error.message).toContain(
      'Maximum MFA verification attempts exceeded',
    );
    expect(error.message).toContain('5/3');
    expect(error.code).toBe('AUTH_CORE_MFA.ATTEMPTS_EXCEEDED');
    expect(error.type).toBe('DOMAIN.INVALID_STATE');
    expect(error.metadata.attemptsUsed).toBe(5);
    expect(error.metadata.maxAttempts).toBe(3);
  });

  it('should serialize to object correctly', () => {
    const error = MfaAttemptsExceededError.create(10, 5);

    const serialized = error.toObject();

    expect(serialized).toEqual({
      message: expect.stringContaining(
        'Maximum MFA verification attempts exceeded',
      ),
      metadata: {
        attemptsUsed: 10,
        maxAttempts: 5,
      },
      code: 'AUTH_CORE_MFA.ATTEMPTS_EXCEEDED',
      type: 'DOMAIN.INVALID_STATE',
    });
  });

  it('should convert to string correctly', () => {
    const error = MfaAttemptsExceededError.create(3, 2);

    expect(error.toString()).toContain('[AUTH_CORE_MFA.ATTEMPTS_EXCEEDED]');
    expect(error.toString()).toContain(
      'Maximum MFA verification attempts exceeded',
    );
  });
});
