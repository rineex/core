import { describe, expect, it } from 'vitest';

import { MfaChallengeId } from '../mfa-challenge-id.vo';

describe('mfaChallengeId', () => {
  const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

  it('should create a valid MfaChallengeId with a valid UUID string', () => {
    const challengeId = MfaChallengeId.fromString(VALID_UUID);

    expect(challengeId).toBeInstanceOf(MfaChallengeId);
    expect(challengeId.value).toBe(VALID_UUID);
  });

  it('should throw an error when creating with an empty string', () => {
    expect(() => MfaChallengeId.fromString('')).toThrow('Invalid UUID');
  });

  it('should throw an error when creating with an invalid UUID', () => {
    expect(() => MfaChallengeId.fromString('short')).toThrow('Invalid UUID');
    expect(() => MfaChallengeId.fromString('not-a-uuid')).toThrow(
      'Invalid UUID',
    );
  });

  it('should generate a valid MfaChallengeId', () => {
    const challengeId = MfaChallengeId.generate();

    expect(challengeId).toBeInstanceOf(MfaChallengeId);
    expect(challengeId.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('should convert to string correctly', () => {
    const challengeId = MfaChallengeId.fromString(VALID_UUID);

    expect(challengeId.toString()).toBe(VALID_UUID);
  });
});
