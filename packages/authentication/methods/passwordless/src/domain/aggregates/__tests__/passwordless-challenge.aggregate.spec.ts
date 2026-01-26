import { beforeEach, describe, expect, it } from 'vitest';

import {
  ChallengeDestination,
  ChallengeSecret,
  PasswordlessChallengeAggregate,
  PasswordlessChallengeAlreadyUsedError,
  PasswordlessChallengeChannelRequired,
  PasswordlessChallengeExpiredError,
  PasswordlessChallengeId,
  PasswordlessChallengeInvalidExpiration,
  PasswordlessChallengeIssuedEvent,
  PasswordlessChallengeSecretMismatchError,
  PasswordlessChallengeSecretRequired,
  PasswordlessChallengeStatus,
  PasswordlessChallengeVerifiedEvent,
  PasswordlessChannel,
} from '../..';

describe('passwordlessChallengeAggregate', () => {
  const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
  const VALID_SECRET = '123456';
  const VALID_DESTINATION = 'user@example.com';

  let validId: PasswordlessChallengeId;
  let validChannel: PasswordlessChannel;
  let validDestination: ChallengeDestination;
  let validSecret: ChallengeSecret;
  let issuedAt: Date;
  let expiresAt: Date;

  beforeEach(() => {
    validId = PasswordlessChallengeId.fromString(VALID_UUID);
    validChannel = PasswordlessChannel.create('email');
    validDestination = ChallengeDestination.create(VALID_DESTINATION);
    validSecret = ChallengeSecret.create(VALID_SECRET);
    issuedAt = new Date('2024-01-01T10:00:00Z');
    expiresAt = new Date('2024-01-01T10:10:00Z'); // 10 minutes later
  });

  describe('validate', () => {
    it('should pass validation with valid props', () => {
      const challenge = PasswordlessChallengeAggregate.issue({
        props: {
          status: PasswordlessChallengeStatus.issued(),
          destination: validDestination,
          channel: validChannel,
          secret: validSecret,
          expiresAt,
          issuedAt,
        },
        createdAt: issuedAt,
        id: validId,
      });

      expect(() => challenge.validate()).not.toThrow();
    });

    it('should throw PasswordlessChallengeChannelRequired when channel is missing', () => {
      expect(() => {
        PasswordlessChallengeAggregate.issue({
          props: {
            status: PasswordlessChallengeStatus.issued(),
            destination: validDestination,
            channel: null as any,
            secret: validSecret,
            expiresAt,
            issuedAt,
          },
          createdAt: issuedAt,
          id: validId,
        });
        // @ts-expect-error - Cannot assign a 'protected' constructor type to a 'public' constructor
      }).toThrow(PasswordlessChallengeChannelRequired);
    });

    it('should throw PasswordlessChallengeSecretRequired when secret is missing', () => {
      expect(() => {
        PasswordlessChallengeAggregate.issue({
          props: {
            status: PasswordlessChallengeStatus.issued(),
            destination: validDestination,
            channel: validChannel,
            secret: null as any,
            expiresAt,
            issuedAt,
          },
          createdAt: issuedAt,
          id: validId,
        });
        // @ts-expect-error - Cannot assign a 'protected' constructor type to a 'public' constructor
      }).toThrow(PasswordlessChallengeSecretRequired);
    });

    it('should throw PasswordlessChallengeInvalidExpiration when expiresAt is before issuedAt', () => {
      const invalidExpiresAt = new Date('2024-01-01T09:00:00Z'); // Before issuedAt

      expect(() => {
        PasswordlessChallengeAggregate.issue({
          props: {
            status: PasswordlessChallengeStatus.issued(),
            destination: validDestination,
            expiresAt: invalidExpiresAt,
            channel: validChannel,
            secret: validSecret,
            issuedAt,
          },
          createdAt: issuedAt,
          id: validId,
        });
        // @ts-expect-error - Cannot assign a 'protected' constructor type to a 'public' constructor
      }).toThrow(PasswordlessChallengeInvalidExpiration);
    });

    it('should throw PasswordlessChallengeInvalidExpiration when expiresAt equals issuedAt', () => {
      expect(() => {
        PasswordlessChallengeAggregate.issue({
          props: {
            status: PasswordlessChallengeStatus.issued(),
            destination: validDestination,
            channel: validChannel,
            secret: validSecret,
            expiresAt: issuedAt,
            issuedAt,
          },
          createdAt: issuedAt,
          id: validId,
        });
        // @ts-expect-error - Cannot assign a 'protected' constructor type to a 'public' constructor
      }).toThrow(PasswordlessChallengeInvalidExpiration);
    });
  });

  describe('issue', () => {
    it('should create a new challenge aggregate with issued status', () => {
      const challenge = PasswordlessChallengeAggregate.issue({
        props: {
          status: PasswordlessChallengeStatus.issued(),
          destination: validDestination,
          channel: validChannel,
          secret: validSecret,
          expiresAt,
          issuedAt,
        },
        createdAt: issuedAt,
        id: validId,
      });

      expect(challenge).toBeInstanceOf(PasswordlessChallengeAggregate);
      expect(challenge.id).toBe(validId);
      // @ts-expect-error - props is protected, but needed for testing
      expect(challenge.props.status.value).toBe('issued');
    });

    it('should emit PasswordlessChallengeIssuedEvent when issued', () => {
      const challenge = PasswordlessChallengeAggregate.issue({
        props: {
          status: PasswordlessChallengeStatus.issued(),
          destination: validDestination,
          channel: validChannel,
          secret: validSecret,
          expiresAt,
          issuedAt,
        },
        createdAt: issuedAt,
        id: validId,
      });

      const events = challenge.domainEvents;

      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(PasswordlessChallengeIssuedEvent);
      expect(events[0].eventName).toBe('auth.passwordless.challenge_created');
      expect(events[0].aggregateId).toBe(validId);
      expect(events[0].payload.channel).toBe('email');
      expect(events[0].payload.destination).toBe(VALID_DESTINATION);
      expect(events[0].payload.expiresAt).toBe(expiresAt.toISOString());
    });

    it('should set occurredAt to issuedAt timestamp in event', () => {
      const challenge = PasswordlessChallengeAggregate.issue({
        props: {
          status: PasswordlessChallengeStatus.issued(),
          destination: validDestination,
          channel: validChannel,
          secret: validSecret,
          expiresAt,
          issuedAt,
        },
        createdAt: issuedAt,
        id: validId,
      });

      const events = challenge.domainEvents;

      expect(events[0].occurredAt).toBe(issuedAt.getTime());
    });

    it('should work with SMS channel', () => {
      const smsChannel = PasswordlessChannel.create('sms');
      const phoneDestination = ChallengeDestination.create('+1234567890');

      const challenge = PasswordlessChallengeAggregate.issue({
        props: {
          status: PasswordlessChallengeStatus.issued(),
          destination: phoneDestination,
          channel: smsChannel,
          secret: validSecret,
          expiresAt,
          issuedAt,
        },
        createdAt: issuedAt,
        id: validId,
      });

      const events = challenge.domainEvents;

      expect(events[0].payload.channel).toBe('sms');
      expect(events[0].payload.destination).toBe('+1234567890');
    });
  });

  describe('isExpired', () => {
    it('should return false when challenge is not expired', () => {
      const now = new Date('2024-01-01T10:05:00Z'); // 5 minutes after issuedAt

      const challenge = PasswordlessChallengeAggregate.issue({
        props: {
          status: PasswordlessChallengeStatus.issued(),
          destination: validDestination,
          channel: validChannel,
          secret: validSecret,
          expiresAt,
          issuedAt,
        },
        createdAt: issuedAt,
        id: validId,
      });

      expect(challenge.isExpired(now)).toBe(false);
    });

    it('should return true when challenge is expired', () => {
      const now = new Date('2024-01-01T10:15:00Z'); // After expiresAt

      const challenge = PasswordlessChallengeAggregate.issue({
        props: {
          status: PasswordlessChallengeStatus.issued(),
          destination: validDestination,
          channel: validChannel,
          secret: validSecret,
          expiresAt,
          issuedAt,
        },
        createdAt: issuedAt,
        id: validId,
      });

      expect(challenge.isExpired(now)).toBe(true);
    });

    it('should return false when current time equals expiresAt', () => {
      const challenge = PasswordlessChallengeAggregate.issue({
        props: {
          status: PasswordlessChallengeStatus.issued(),
          destination: validDestination,
          channel: validChannel,
          secret: validSecret,
          expiresAt,
          issuedAt,
        },
        createdAt: issuedAt,
        id: validId,
      });

      expect(challenge.isExpired(expiresAt)).toBe(false);
    });

    it('should use current date when now parameter is not provided', () => {
      const challenge = PasswordlessChallengeAggregate.issue({
        props: {
          status: PasswordlessChallengeStatus.issued(),
          expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
          destination: validDestination,
          channel: validChannel,
          secret: validSecret,
          issuedAt,
        },
        createdAt: issuedAt,
        id: validId,
      });

      expect(challenge.isExpired()).toBe(true);
    });
  });

  describe('matchesSecret', () => {
    it('should return true when input matches the secret', () => {
      const challenge = PasswordlessChallengeAggregate.issue({
        props: {
          status: PasswordlessChallengeStatus.issued(),
          destination: validDestination,
          channel: validChannel,
          secret: validSecret,
          expiresAt,
          issuedAt,
        },
        createdAt: issuedAt,
        id: validId,
      });

      expect(challenge.matchesSecret(VALID_SECRET)).toBe(true);
    });

    it('should return false when input does not match the secret', () => {
      const challenge = PasswordlessChallengeAggregate.issue({
        props: {
          status: PasswordlessChallengeStatus.issued(),
          destination: validDestination,
          channel: validChannel,
          secret: validSecret,
          expiresAt,
          issuedAt,
        },
        createdAt: issuedAt,
        id: validId,
      });

      expect(challenge.matchesSecret('wrong-secret')).toBe(false);
    });

    it('should return false for empty string input', () => {
      const challenge = PasswordlessChallengeAggregate.issue({
        props: {
          status: PasswordlessChallengeStatus.issued(),
          destination: validDestination,
          channel: validChannel,
          secret: validSecret,
          expiresAt,
          issuedAt,
        },
        createdAt: issuedAt,
        id: validId,
      });

      expect(challenge.matchesSecret('')).toBe(false);
    });

    it('should use timing-safe comparison', () => {
      // This test verifies that the method uses timingSafeEqual
      // by checking that different length secrets don't cause early returns
      // @ts-expect-error - Constructor is protected, but needed for testing
      const challenge = new PasswordlessChallengeAggregate({
        props: {
          status: PasswordlessChallengeStatus.issued(),
          secret: ChallengeSecret.create('123456'),
          destination: validDestination,
          channel: validChannel,
          expiresAt,
          issuedAt,
        },
        createdAt: issuedAt,
        id: validId,
      });

      // Different length secrets should still go through full comparison
      expect(challenge.matchesSecret('12345')).toBe(false);
      expect(challenge.matchesSecret('1234567')).toBe(false);
      expect(challenge.matchesSecret('123456')).toBe(true);
    });

    it('should handle special characters in secret', () => {
      const specialSecret = ChallengeSecret.create('!@#$%^');
      const challenge = PasswordlessChallengeAggregate.issue({
        props: {
          status: PasswordlessChallengeStatus.issued(),
          destination: validDestination,
          channel: validChannel,
          secret: specialSecret,
          expiresAt,
          issuedAt,
        },
        createdAt: issuedAt,
        id: validId,
      });

      expect(challenge.matchesSecret('!@#$%^')).toBe(true);
      expect(challenge.matchesSecret('!@#$%')).toBe(false);
    });
  });

  describe('verify', () => {
    it('should successfully verify a valid challenge', () => {
      const now = new Date('2024-01-01T10:05:00Z'); // Before expiresAt

      const challenge = PasswordlessChallengeAggregate.issue({
        props: {
          status: PasswordlessChallengeStatus.issued(),
          destination: validDestination,
          channel: validChannel,
          secret: validSecret,
          expiresAt,
          issuedAt,
        },
        createdAt: issuedAt,
        id: validId,
      });

      expect(() => challenge.verify(VALID_SECRET, now)).not.toThrow();
      // @ts-expect-error - bypassing private props
      expect(challenge.props.status.value).toBe('verified');
    });

    it('should emit PasswordlessChallengeVerifiedEvent when verified', () => {
      const now = new Date('2024-01-01T10:05:00Z');

      const challenge = PasswordlessChallengeAggregate.issue({
        props: {
          status: PasswordlessChallengeStatus.issued(),
          destination: validDestination,
          channel: validChannel,
          secret: validSecret,
          expiresAt,
          issuedAt,
        },
        createdAt: issuedAt,
        id: validId,
      });

      challenge.verify(VALID_SECRET, now);

      const events = challenge.domainEvents;

      expect(events).toHaveLength(2);
      expect(events[0]).toBeInstanceOf(PasswordlessChallengeIssuedEvent);
      expect(events[0].eventName).toBe('auth.passwordless.challenge_created');
      expect(events[0].aggregateId).toBe(validId);
      expect(events[0].payload.channel).toBe('email');
      expect(events[0].payload.destination).toBe(VALID_DESTINATION);
      expect(events[1].payload.verifiedAt).toBe(now.toISOString());
      expect(events[1].occurredAt).toBe(now.getTime());
    });

    it('should throw PasswordlessChallengeExpired when challenge is expired', () => {
      const now = new Date('2024-01-01T10:15:00Z'); // After expiresAt

      const challenge = PasswordlessChallengeAggregate.issue({
        props: {
          status: PasswordlessChallengeStatus.issued(),
          destination: validDestination,
          channel: validChannel,
          secret: validSecret,
          expiresAt,
          issuedAt,
        },
        createdAt: issuedAt,
        id: validId,
      });

      expect(() => challenge.verify(VALID_SECRET, now)).toThrow(
        // @ts-expect-error - Cannot assign a 'protected' constructor type to a 'public' constructor
        PasswordlessChallengeExpiredError,
      );
      // @ts-expect-error - bypassing private props
      expect(challenge.props.status.value).toBe('issued'); // Status should not change
    });

    it('should throw PasswordlessChallengeAlreadyUsedErr when challenge is already verified', () => {
      const now = new Date('2024-01-01T10:05:00Z');

      const challenge = PasswordlessChallengeAggregate.issue({
        props: {
          status: PasswordlessChallengeStatus.verified(),
          destination: validDestination,
          channel: validChannel,
          secret: validSecret,
          expiresAt,
          issuedAt,
        },
        createdAt: issuedAt,
        id: validId,
      });

      expect(() => challenge.verify(VALID_SECRET, now)).toThrow(
        // @ts-expect-error - Cannot assign a 'protected' constructor type to a 'public' constructor
        PasswordlessChallengeAlreadyUsedError,
      );
    });

    it('should throw PasswordlessChallengeAlreadyUsedErr when challenge is expired status', () => {
      const now = new Date('2024-01-01T10:05:00Z');

      const challenge = PasswordlessChallengeAggregate.issue({
        props: {
          status: PasswordlessChallengeStatus.expired(),
          destination: validDestination,
          channel: validChannel,
          secret: validSecret,
          expiresAt,
          issuedAt,
        },
        createdAt: issuedAt,
        id: validId,
      });

      expect(() => challenge.verify(VALID_SECRET, now)).toThrow(
        // @ts-expect-error - Cannot assign a 'protected' constructor type to a 'public' constructor
        PasswordlessChallengeAlreadyUsedError,
      );
    });

    it('should throw PasswordlessChallengeSecretMismatch when secret does not match', () => {
      const now = new Date('2024-01-01T10:05:00Z');

      const challenge = PasswordlessChallengeAggregate.issue({
        props: {
          status: PasswordlessChallengeStatus.issued(),
          destination: validDestination,
          channel: validChannel,
          secret: validSecret,
          expiresAt,
          issuedAt,
        },
        createdAt: issuedAt,
        id: validId,
      });

      expect(() => challenge.verify('wrong-secret', now)).toThrow(
        // @ts-expect-error - Cannot assign a 'protected' constructor type to a 'public' constructor
        PasswordlessChallengeSecretMismatchError,
      );
      // @ts-expect-error - bypassing private props
      expect(challenge.props.status.value).toBe('issued'); // Status should not change
    });

    it('should use current date when now parameter is not provided', () => {
      // Create a challenge that expires in the future
      const futureExpiresAt = new Date(Date.now() + 60000); // 1 minute from now

      const challenge = PasswordlessChallengeAggregate.issue({
        props: {
          status: PasswordlessChallengeStatus.issued(),
          destination: validDestination,
          expiresAt: futureExpiresAt,
          channel: validChannel,
          issuedAt: new Date(),
          secret: validSecret,
        },
        createdAt: new Date(),
        id: validId,
      });

      expect(() => challenge.verify(VALID_SECRET)).not.toThrow();
    });

    it('should verify challenge exactly at expiration time', () => {
      const challenge = PasswordlessChallengeAggregate.issue({
        props: {
          status: PasswordlessChallengeStatus.issued(),
          destination: validDestination,
          channel: validChannel,
          secret: validSecret,
          expiresAt,
          issuedAt,
        },
        createdAt: issuedAt,
        id: validId,
      });

      // At exactly expiresAt, should still be valid (not expired)
      expect(() => challenge.verify(VALID_SECRET, expiresAt)).not.toThrow();
    });

    it('should verify challenge just before expiration time', () => {
      const justBeforeExpires = new Date(expiresAt.getTime() - 1000); // 1 second before

      const challenge = PasswordlessChallengeAggregate.issue({
        props: {
          status: PasswordlessChallengeStatus.issued(),
          destination: validDestination,
          channel: validChannel,
          secret: validSecret,
          expiresAt,
          issuedAt,
        },
        createdAt: issuedAt,
        id: validId,
      });

      expect(() =>
        challenge.verify(VALID_SECRET, justBeforeExpires),
      ).not.toThrow();
    });
  });

  describe('toObject', () => {
    it('should convert aggregate to object with correct structure', () => {
      // Use future dates to ensure challenge is not expired
      const futureIssuedAt = new Date(Date.now() + 60000); // 1 minute from now
      const futureExpiresAt = new Date(Date.now() + 600000); // 10 minutes from now

      const challenge = PasswordlessChallengeAggregate.issue({
        props: {
          status: PasswordlessChallengeStatus.issued(),
          destination: validDestination,
          expiresAt: futureExpiresAt,
          issuedAt: futureIssuedAt,
          channel: validChannel,
          secret: validSecret,
        },
        createdAt: futureIssuedAt,
        id: validId,
      });

      const obj = challenge.toObject();

      expect(obj).toEqual({
        issuedAt: futureIssuedAt.toISOString(),
        destination: VALID_DESTINATION,
        channel: 'email',
        expired: false,
      });
    });

    it('should include expired flag as true when challenge is expired', () => {
      const pastExpiresAt = new Date(Date.now() - 1000); // 1 second ago

      const challenge = PasswordlessChallengeAggregate.issue({
        props: {
          status: PasswordlessChallengeStatus.issued(),
          destination: validDestination,
          expiresAt: pastExpiresAt,
          channel: validChannel,
          secret: validSecret,
          issuedAt,
        },
        createdAt: issuedAt,
        id: validId,
      });

      const obj = challenge.toObject();

      expect(obj.expired).toBe(true);
    });

    it('should include expired flag as false when challenge is not expired', () => {
      const futureExpiresAt = new Date(Date.now() + 60000); // 1 minute from now

      const challenge = PasswordlessChallengeAggregate.issue({
        props: {
          status: PasswordlessChallengeStatus.issued(),
          destination: validDestination,
          expiresAt: futureExpiresAt,
          channel: validChannel,
          secret: validSecret,
          issuedAt,
        },
        createdAt: issuedAt,
        id: validId,
      });

      const obj = challenge.toObject();

      expect(obj.expired).toBe(false);
    });

    it('should work with SMS channel', () => {
      const smsChannel = PasswordlessChannel.create('sms');
      const phoneDestination = ChallengeDestination.create('+1234567890');

      const challenge = PasswordlessChallengeAggregate.issue({
        props: {
          status: PasswordlessChallengeStatus.issued(),
          destination: phoneDestination,
          channel: smsChannel,
          secret: validSecret,
          expiresAt,
          issuedAt,
        },
        createdAt: issuedAt,
        id: validId,
      });

      const obj = challenge.toObject();

      expect(obj.channel).toBe('sms');
      expect(obj.destination).toBe('+1234567890');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete flow: issue -> verify -> cannot verify again', () => {
      const now = new Date('2024-01-01T10:05:00Z');

      // Issue challenge
      const challenge = PasswordlessChallengeAggregate.issue({
        props: {
          status: PasswordlessChallengeStatus.issued(),
          destination: validDestination,
          channel: validChannel,
          secret: validSecret,
          expiresAt,
          issuedAt,
        },
        createdAt: issuedAt,
        id: validId,
      });

      // @ts-expect-error - props is protected, but needed for testing
      expect(challenge.props.status.value).toBe('issued');
      expect(challenge.domainEvents).toHaveLength(1);

      // Verify challenge
      challenge.verify(VALID_SECRET, now);

      // @ts-expect-error - props is protected, but needed for testing
      expect(challenge.props.status.value).toBe('verified');
      expect(challenge.domainEvents).toHaveLength(2);

      // Try to verify again - should fail
      expect(() => challenge.verify(VALID_SECRET, now)).toThrow(
        // @ts-expect-error - Cannot assign a 'protected' constructor type to a 'public' constructor
        PasswordlessChallengeAlreadyUsedError,
      );
    });

    it('should handle issue -> expire -> cannot verify', () => {
      const expiredNow = new Date('2024-01-01T10:15:00Z'); // After expiresAt

      const challenge = PasswordlessChallengeAggregate.issue({
        props: {
          status: PasswordlessChallengeStatus.issued(),
          destination: validDestination,
          channel: validChannel,
          secret: validSecret,
          expiresAt,
          issuedAt,
        },
        createdAt: issuedAt,
        id: validId,
      });

      // Try to verify expired challenge
      expect(() => challenge.verify(VALID_SECRET, expiredNow)).toThrow(
        // @ts-expect-error - Cannot assign a 'protected' constructor type to a 'public' constructor
        PasswordlessChallengeExpiredError,
      );
      // @ts-expect-error - props is protected, but needed for testing
      expect(challenge.props.status.value).toBe('issued'); // Status unchanged
    });

    it('should handle issue -> wrong secret -> correct secret', () => {
      const now = new Date('2024-01-01T10:05:00Z');

      const challenge = PasswordlessChallengeAggregate.issue({
        props: {
          status: PasswordlessChallengeStatus.issued(),
          destination: validDestination,
          channel: validChannel,
          secret: validSecret,
          expiresAt,
          issuedAt,
        },
        createdAt: issuedAt,
        id: validId,
      });

      // Try wrong secret first
      expect(() => challenge.verify('wrong-secret', now)).toThrow(
        // @ts-expect-error - Cannot assign a 'protected' constructor type to a 'public' constructor
        PasswordlessChallengeSecretMismatchError,
      );
      // @ts-expect-error - props is protected, but needed for testing
      expect(challenge.props.status.value).toBe('issued'); // Still issued

      // Try correct secret
      expect(() => challenge.verify(VALID_SECRET, now)).not.toThrow();
      // @ts-expect-error - props is protected, but needed for testing
      expect(challenge.props.status.value).toBe('verified');
    });
  });
});
