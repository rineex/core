import { describe, expect, it } from 'vitest';

import { IdentityId } from '@/domain/identity';

import { MfaChallengeExpiredError } from '../../errors/mfa-challenge-expired.error';
import { MfaChallengeId } from '../../value-objects/mfa-challenge-id.vo';
import { MFAChallenge } from '../mfa-challenge.entity';

describe('mFAChallenge', () => {
  const now = new Date();
  const issuedAt = new Date(now.getTime() - 60000); // 1 minute ago
  const expiresAt = new Date(now.getTime() + 300000); // 5 minutes from now

  it('should create a valid MFA challenge', () => {
    const challenge = MFAChallenge.create({
      props: {
        identityId: IdentityId.generate(),
        challengeType: 'TOTP',
        expiresAt,
        issuedAt,
      },
      id: MfaChallengeId.generate(),
    });

    expect(challenge).toBeInstanceOf(MFAChallenge);
    expect(challenge.challengeType).toBe('TOTP');
    expect(challenge.isExpired(now)).toBe(false);
  });

  it('should detect expired challenge', () => {
    const pastExpiresAt = new Date(now.getTime() - 1000); // 1 second ago

    const challenge = MFAChallenge.create({
      props: {
        identityId: IdentityId.generate(),
        expiresAt: pastExpiresAt,
        challengeType: 'TOTP',
        issuedAt,
      },
      id: MfaChallengeId.generate(),
    });

    expect(challenge.isExpired(now)).toBe(true);
  });

  it('should detect non-expired challenge', () => {
    const futureExpiresAt = new Date(now.getTime() + 60000); // 1 minute from now

    const challenge = MFAChallenge.create({
      props: {
        identityId: IdentityId.generate(),
        expiresAt: futureExpiresAt,
        challengeType: 'TOTP',
        issuedAt,
      },
      id: MfaChallengeId.generate(),
    });

    expect(challenge.isExpired(now)).toBe(false);
  });

  it('should throw MfaChallengeExpiredError when expiresAt <= issuedAt', () => {
    expect(() =>
      MFAChallenge.create({
        props: {
          identityId: IdentityId.generate(),
          challengeType: 'TOTP',
          expiresAt: issuedAt, // Same time
          issuedAt,
        },
        id: MfaChallengeId.generate(),
      }),
    ).toThrow(MfaChallengeExpiredError);

    expect(() =>
      MFAChallenge.create({
        props: {
          expiresAt: new Date(issuedAt.getTime() - 1000), // Before issuedAt
          identityId: IdentityId.generate(),
          challengeType: 'TOTP',
          issuedAt,
        },
        id: MfaChallengeId.generate(),
      }),
    ).toThrow(MfaChallengeExpiredError);
  });

  it('should convert to object correctly', () => {
    const identityId = IdentityId.generate();
    const challengeId = MfaChallengeId.generate();

    const challenge = MFAChallenge.create({
      props: {
        challengeType: 'TOTP',
        identityId,
        expiresAt,
        issuedAt,
      },
      id: challengeId,
    });

    const obj = challenge.toObject();

    expect(obj).toEqual({
      identityId: identityId.toString(),
      id: challengeId.toString(),
      challengeType: 'TOTP',
      expiresAt,
      issuedAt,
    });
  });
});
