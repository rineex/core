import { describe, expect, it } from 'vitest';

import { MfaChallengeStatus } from '../mfa-challenge-status.vo';

describe('mfaChallengeStatus', () => {
  it('should create a valid status with "pending"', () => {
    const status = MfaChallengeStatus.create('pending');

    expect(status).toBeInstanceOf(MfaChallengeStatus);
    expect(status.value).toBe('pending');
  });

  it('should create a valid status with "verified"', () => {
    const status = MfaChallengeStatus.create('verified');

    expect(status).toBeInstanceOf(MfaChallengeStatus);
    expect(status.value).toBe('verified');
  });

  it('should create a valid status with "expired"', () => {
    const status = MfaChallengeStatus.create('expired');

    expect(status).toBeInstanceOf(MfaChallengeStatus);
    expect(status.value).toBe('expired');
  });

  it('should create a valid status with "failed"', () => {
    const status = MfaChallengeStatus.create('failed');

    expect(status).toBeInstanceOf(MfaChallengeStatus);
    expect(status.value).toBe('failed');
  });

  it('should create pending status using static method', () => {
    const status = MfaChallengeStatus.pending();

    expect(status.value).toBe('pending');
  });

  it('should create verified status using static method', () => {
    const status = MfaChallengeStatus.verified();

    expect(status.value).toBe('verified');
  });

  it('should throw an error when created with invalid status', () => {
    expect(() => MfaChallengeStatus.create('invalid' as any)).toThrow();
  });

  it('should convert to string correctly', () => {
    const status = MfaChallengeStatus.create('pending');

    expect(status.toString()).toBe('pending');
  });
});
