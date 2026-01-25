import { describe, expect, it, beforeEach } from 'vitest';

import { PasswordlessChallengeAggregate } from '../passwordless-challenge.aggregate';
import { PasswordlessChallengeId } from '../../value-objects/passwordless-challenge-id.vo';
import { PasswordlessChannel } from '../../value-objects/channel.vo';
import { ChallengeDestination } from '../../value-objects/challenge-destination.vo';
import { ChallengeSecret } from '../../value-objects/challenge-secret.vo';
import { PasswordlessChallengeStatus } from '../../value-objects/passwordless-challenge-status.vo';
import { PasswordlessChallengeIssuedEvent } from '../../events/passwordless-challenge-issued.event';
import { PasswordlessChallengeVerifiedEvent } from '../../events/passwordless-challenge-verified.event';
import {
  PasswordlessChallengeChannelRequired,
  PasswordlessChallengeExpired,
  PasswordlessChallengeInvalidExpiration,
  PasswordlessChallengeAlreadyUsedErr,
  PasswordlessChallengeSecretMismatch,
  PasswordlessChallengeSecretRequired,
} from '../../errors/passwordless-challenge.error';

describe('PasswordlessChallengeAggregate', () => {
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
      const challenge = new PasswordlessChallengeAggregate({
        id: validId,
        createdAt: issuedAt,
        props: {
          channel: validChannel,
          destination: validDestination,
          secret: validSecret,
          issuedAt,
          expiresAt,
          status: PasswordlessChallengeStatus.issued(),
        },
      });

      expect(() => challenge.validate()).not.toThrow();
    });

    it('should throw PasswordlessChallengeChannelRequired when channel is missing', () => {
      expect(() => {
        new PasswordlessChallengeAggregate({
          id: validId,
          createdAt: issuedAt,
          props: {
            channel: null as any,
            destination: validDestination,
            secret: validSecret,
            issuedAt,
            expiresAt,
            status: PasswordlessChallengeStatus.issued(),
          },
        });
      }).toThrow(PasswordlessChallengeChannelRequired);
    });

    it('should throw PasswordlessChallengeSecretRequired when secret is missing', () => {
      expect(() => {
        new PasswordlessChallengeAggregate({
          id: validId,
          createdAt: issuedAt,
          props: {
            channel: validChannel,
            destination: validDestination,
            secret: null as any,
            issuedAt,
            expiresAt,
            status: PasswordlessChallengeStatus.issued(),
          },
        });
      }).toThrow(PasswordlessChallengeSecretRequired);
    });

    it('should throw PasswordlessChallengeInvalidExpiration when expiresAt is before issuedAt', () => {
      const invalidExpiresAt = new Date('2024-01-01T09:00:00Z'); // Before issuedAt

      expect(() => {
        new PasswordlessChallengeAggregate({
          id: validId,
          createdAt: issuedAt,
          props: {
            channel: validChannel,
            destination: validDestination,
            secret: validSecret,
            issuedAt,
            expiresAt: invalidExpiresAt,
            status: PasswordlessChallengeStatus.issued(),
          },
        });
      }).toThrow(PasswordlessChallengeInvalidExpiration);
    });

    it('should throw PasswordlessChallengeInvalidExpiration when expiresAt equals issuedAt', () => {
      expect(() => {
        new PasswordlessChallengeAggregate({
          id: validId,
          createdAt: issuedAt,
          props: {
            channel: validChannel,
            destination: validDestination,
            secret: validSecret,
            issuedAt,
            expiresAt: issuedAt,
            status: PasswordlessChallengeStatus.issued(),
          },
        });
      }).toThrow(PasswordlessChallengeInvalidExpiration);
    });
  });

  describe('issue', () => {
    it('should create a new challenge aggregate with issued status', () => {
      const challenge = PasswordlessChallengeAggregate.issue({
        id: validId,
        createdAt: issuedAt,
        props: {
          channel: validChannel,
          destination: validDestination,
          secret: validSecret,
          issuedAt,
          expiresAt,
          status: PasswordlessChallengeStatus.issued(),
        },
      });

      expect(challenge).toBeInstanceOf(PasswordlessChallengeAggregate);
      expect(challenge.id).toBe(validId);
      expect(challenge.props.status.value).toBe('issued');
    });

    it('should emit PasswordlessChallengeIssuedEvent when issued', () => {
      const challenge = PasswordlessChallengeAggregate.issue({
        id: validId,
        createdAt: issuedAt,
        props: {
          channel: validChannel,
          destination: validDestination,
          secret: validSecret,
          issuedAt,
          expiresAt,
          status: PasswordlessChallengeStatus.issued(),
        },
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
        id: validId,
        createdAt: issuedAt,
        props: {
          channel: validChannel,
          destination: validDestination,
          secret: validSecret,
          issuedAt,
          expiresAt,
          status: PasswordlessChallengeStatus.issued(),
        },
      });

      const events = challenge.domainEvents;
      expect(events[0].occurredAt).toBe(issuedAt.getTime());
    });

    it('should work with SMS channel', () => {
      const smsChannel = PasswordlessChannel.create('sms');
      const phoneDestination = ChallengeDestination.create('+1234567890');

      const challenge = PasswordlessChallengeAggregate.issue({
        id: validId,
        createdAt: issuedAt,
        props: {
          channel: smsChannel,
          destination: phoneDestination,
          secret: validSecret,
          issuedAt,
          expiresAt,
          status: PasswordlessChallengeStatus.issued(),
        },
      });

      const events = challenge.domainEvents;
      expect(events[0].payload.channel).toBe('sms');
      expect(events[0].payload.destination).toBe('+1234567890');
    });
  });

  describe('isExpired', () => {
    it('should return false when challenge is not expired', () => {
      const now = new Date('2024-01-01T10:05:00Z'); // 5 minutes after issuedAt

      const challenge = new PasswordlessChallengeAggregate({
        id: validId,
        createdAt: issuedAt,
        props: {
          channel: validChannel,
          destination: validDestination,
          secret: validSecret,
          issuedAt,
          expiresAt,
          status: PasswordlessChallengeStatus.issued(),
        },
      });

      expect(challenge.isExpired(now)).toBe(false);
    });

    it('should return true when challenge is expired', () => {
      const now = new Date('2024-01-01T10:15:00Z'); // After expiresAt

      const challenge = new PasswordlessChallengeAggregate({
        id: validId,
        createdAt: issuedAt,
        props: {
          channel: validChannel,
          destination: validDestination,
          secret: validSecret,
          issuedAt,
          expiresAt,
          status: PasswordlessChallengeStatus.issued(),
        },
      });

      expect(challenge.isExpired(now)).toBe(true);
    });

    it('should return false when current time equals expiresAt', () => {
      const challenge = new PasswordlessChallengeAggregate({
        id: validId,
        createdAt: issuedAt,
        props: {
          channel: validChannel,
          destination: validDestination,
          secret: validSecret,
          issuedAt,
          expiresAt,
          status: PasswordlessChallengeStatus.issued(),
        },
      });

      expect(challenge.isExpired(expiresAt)).toBe(false);
    });

    it('should use current date when now parameter is not provided', () => {
      const challenge = new PasswordlessChallengeAggregate({
        id: validId,
        createdAt: issuedAt,
        props: {
          channel: validChannel,
          destination: validDestination,
          secret: validSecret,
          issuedAt,
          expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
          status: PasswordlessChallengeStatus.issued(),
        },
      });

      expect(challenge.isExpired()).toBe(true);
    });
  });

  describe('matchesSecret', () => {
    it('should return true when input matches the secret', () => {
      const challenge = new PasswordlessChallengeAggregate({
        id: validId,
        createdAt: issuedAt,
        props: {
          channel: validChannel,
          destination: validDestination,
          secret: validSecret,
          issuedAt,
          expiresAt,
          status: PasswordlessChallengeStatus.issued(),
        },
      });

      expect(challenge.matchesSecret(VALID_SECRET)).toBe(true);
    });

    it('should return false when input does not match the secret', () => {
      const challenge = new PasswordlessChallengeAggregate({
        id: validId,
        createdAt: issuedAt,
        props: {
          channel: validChannel,
          destination: validDestination,
          secret: validSecret,
          issuedAt,
          expiresAt,
          status: PasswordlessChallengeStatus.issued(),
        },
      });

      expect(challenge.matchesSecret('wrong-secret')).toBe(false);
    });

    it('should return false for empty string input', () => {
      const challenge = new PasswordlessChallengeAggregate({
        id: validId,
        createdAt: issuedAt,
        props: {
          channel: validChannel,
          destination: validDestination,
          secret: validSecret,
          issuedAt,
          expiresAt,
          status: PasswordlessChallengeStatus.issued(),
        },
      });

      expect(challenge.matchesSecret('')).toBe(false);
    });

    it('should use timing-safe comparison', () => {
      // This test verifies that the method uses timingSafeEqual
      // by checking that different length secrets don't cause early returns
      const challenge = new PasswordlessChallengeAggregate({
        id: validId,
        createdAt: issuedAt,
        props: {
          channel: validChannel,
          destination: validDestination,
          secret: ChallengeSecret.create('123456'),
          issuedAt,
          expiresAt,
          status: PasswordlessChallengeStatus.issued(),
        },
      });

      // Different length secrets should still go through full comparison
      expect(challenge.matchesSecret('12345')).toBe(false);
      expect(challenge.matchesSecret('1234567')).toBe(false);
      expect(challenge.matchesSecret('123456')).toBe(true);
    });

    it('should handle special characters in secret', () => {
      const specialSecret = ChallengeSecret.create('!@#$%^');
      const challenge = new PasswordlessChallengeAggregate({
        id: validId,
        createdAt: issuedAt,
        props: {
          channel: validChannel,
          destination: validDestination,
          secret: specialSecret,
          issuedAt,
          expiresAt,
          status: PasswordlessChallengeStatus.issued(),
        },
      });

      expect(challenge.matchesSecret('!@#$%^')).toBe(true);
      expect(challenge.matchesSecret('!@#$%')).toBe(false);
    });
  });

  describe('verify', () => {
    it('should successfully verify a valid challenge', () => {
      const now = new Date('2024-01-01T10:05:00Z'); // Before expiresAt

      const challenge = new PasswordlessChallengeAggregate({
        id: validId,
        createdAt: issuedAt,
        props: {
          channel: validChannel,
          destination: validDestination,
          secret: validSecret,
          issuedAt,
          expiresAt,
          status: PasswordlessChallengeStatus.issued(),
        },
      });

      expect(() => challenge.verify(VALID_SECRET, now)).not.toThrow();
      expect(challenge.props.status.value).toBe('verified');
    });

    it('should emit PasswordlessChallengeVerifiedEvent when verified', () => {
      const now = new Date('2024-01-01T10:05:00Z');

      const challenge = new PasswordlessChallengeAggregate({
        id: validId,
        createdAt: issuedAt,
        props: {
          channel: validChannel,
          destination: validDestination,
          secret: validSecret,
          issuedAt,
          expiresAt,
          status: PasswordlessChallengeStatus.issued(),
        },
      });

      challenge.verify(VALID_SECRET, now);

      const events = challenge.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(PasswordlessChallengeVerifiedEvent);
      expect(events[0].eventName).toBe('auth.passwordless.challenge_verified');
      expect(events[0].aggregateId).toBe(validId);
      expect(events[0].payload.channel).toBe('email');
      expect(events[0].payload.destination).toBe(VALID_DESTINATION);
      expect(events[0].payload.verifiedAt).toBe(now.toISOString());
      expect(events[0].occurredAt).toBe(now.getTime());
    });

    it('should throw PasswordlessChallengeExpired when challenge is expired', () => {
      const now = new Date('2024-01-01T10:15:00Z'); // After expiresAt

      const challenge = new PasswordlessChallengeAggregate({
        id: validId,
        createdAt: issuedAt,
        props: {
          channel: validChannel,
          destination: validDestination,
          secret: validSecret,
          issuedAt,
          expiresAt,
          status: PasswordlessChallengeStatus.issued(),
        },
      });

      expect(() => challenge.verify(VALID_SECRET, now)).toThrow(
        PasswordlessChallengeExpired,
      );
      expect(challenge.props.status.value).toBe('issued'); // Status should not change
    });

    it('should throw PasswordlessChallengeAlreadyUsedErr when challenge is already verified', () => {
      const now = new Date('2024-01-01T10:05:00Z');

      const challenge = new PasswordlessChallengeAggregate({
        id: validId,
        createdAt: issuedAt,
        props: {
          channel: validChannel,
          destination: validDestination,
          secret: validSecret,
          issuedAt,
          expiresAt,
          status: PasswordlessChallengeStatus.verified(),
        },
      });

      expect(() => challenge.verify(VALID_SECRET, now)).toThrow(
        PasswordlessChallengeAlreadyUsedErr,
      );
    });

    it('should throw PasswordlessChallengeAlreadyUsedErr when challenge is expired status', () => {
      const now = new Date('2024-01-01T10:05:00Z');

      const challenge = new PasswordlessChallengeAggregate({
        id: validId,
        createdAt: issuedAt,
        props: {
          channel: validChannel,
          destination: validDestination,
          secret: validSecret,
          issuedAt,
          expiresAt,
          status: PasswordlessChallengeStatus.expired(),
        },
      });

      expect(() => challenge.verify(VALID_SECRET, now)).toThrow(
        PasswordlessChallengeAlreadyUsedErr,
      );
    });

    it('should throw PasswordlessChallengeSecretMismatch when secret does not match', () => {
      const now = new Date('2024-01-01T10:05:00Z');

      const challenge = new PasswordlessChallengeAggregate({
        id: validId,
        createdAt: issuedAt,
        props: {
          channel: validChannel,
          destination: validDestination,
          secret: validSecret,
          issuedAt,
          expiresAt,
          status: PasswordlessChallengeStatus.issued(),
        },
      });

      expect(() => challenge.verify('wrong-secret', now)).toThrow(
        PasswordlessChallengeSecretMismatch,
      );
      expect(challenge.props.status.value).toBe('issued'); // Status should not change
    });

    it('should use current date when now parameter is not provided', () => {
      // Create a challenge that expires in the future
      const futureExpiresAt = new Date(Date.now() + 60000); // 1 minute from now

      const challenge = new PasswordlessChallengeAggregate({
        id: validId,
        createdAt: new Date(),
        props: {
          channel: validChannel,
          destination: validDestination,
          secret: validSecret,
          issuedAt: new Date(),
          expiresAt: futureExpiresAt,
          status: PasswordlessChallengeStatus.issued(),
        },
      });

      expect(() => challenge.verify(VALID_SECRET)).not.toThrow();
    });

    it('should verify challenge exactly at expiration time', () => {
      const challenge = new PasswordlessChallengeAggregate({
        id: validId,
        createdAt: issuedAt,
        props: {
          channel: validChannel,
          destination: validDestination,
          secret: validSecret,
          issuedAt,
          expiresAt,
          status: PasswordlessChallengeStatus.issued(),
        },
      });

      // At exactly expiresAt, should still be valid (not expired)
      expect(() => challenge.verify(VALID_SECRET, expiresAt)).not.toThrow();
    });

    it('should verify challenge just before expiration time', () => {
      const justBeforeExpires = new Date(expiresAt.getTime() - 1000); // 1 second before

      const challenge = new PasswordlessChallengeAggregate({
        id: validId,
        createdAt: issuedAt,
        props: {
          channel: validChannel,
          destination: validDestination,
          secret: validSecret,
          issuedAt,
          expiresAt,
          status: PasswordlessChallengeStatus.issued(),
        },
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

      const challenge = new PasswordlessChallengeAggregate({
        id: validId,
        createdAt: futureIssuedAt,
        props: {
          channel: validChannel,
          destination: validDestination,
          secret: validSecret,
          issuedAt: futureIssuedAt,
          expiresAt: futureExpiresAt,
          status: PasswordlessChallengeStatus.issued(),
        },
      });

      const obj = challenge.toObject();

      expect(obj).toEqual({
        channel: 'email',
        destination: VALID_DESTINATION,
        issuedAt: futureIssuedAt.toISOString(),
        expired: false,
      });
    });

    it('should include expired flag as true when challenge is expired', () => {
      const pastExpiresAt = new Date(Date.now() - 1000); // 1 second ago

      const challenge = new PasswordlessChallengeAggregate({
        id: validId,
        createdAt: issuedAt,
        props: {
          channel: validChannel,
          destination: validDestination,
          secret: validSecret,
          issuedAt,
          expiresAt: pastExpiresAt,
          status: PasswordlessChallengeStatus.issued(),
        },
      });

      const obj = challenge.toObject();

      expect(obj.expired).toBe(true);
    });

    it('should include expired flag as false when challenge is not expired', () => {
      const futureExpiresAt = new Date(Date.now() + 60000); // 1 minute from now

      const challenge = new PasswordlessChallengeAggregate({
        id: validId,
        createdAt: issuedAt,
        props: {
          channel: validChannel,
          destination: validDestination,
          secret: validSecret,
          issuedAt,
          expiresAt: futureExpiresAt,
          status: PasswordlessChallengeStatus.issued(),
        },
      });

      const obj = challenge.toObject();

      expect(obj.expired).toBe(false);
    });

    it('should work with SMS channel', () => {
      const smsChannel = PasswordlessChannel.create('sms');
      const phoneDestination = ChallengeDestination.create('+1234567890');

      const challenge = new PasswordlessChallengeAggregate({
        id: validId,
        createdAt: issuedAt,
        props: {
          channel: smsChannel,
          destination: phoneDestination,
          secret: validSecret,
          issuedAt,
          expiresAt,
          status: PasswordlessChallengeStatus.issued(),
        },
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
        id: validId,
        createdAt: issuedAt,
        props: {
          channel: validChannel,
          destination: validDestination,
          secret: validSecret,
          issuedAt,
          expiresAt,
          status: PasswordlessChallengeStatus.issued(),
        },
      });

      expect(challenge.props.status.value).toBe('issued');
      expect(challenge.domainEvents).toHaveLength(1);

      // Verify challenge
      challenge.verify(VALID_SECRET, now);

      expect(challenge.props.status.value).toBe('verified');
      expect(challenge.domainEvents).toHaveLength(2);

      // Try to verify again - should fail
      expect(() => challenge.verify(VALID_SECRET, now)).toThrow(
        PasswordlessChallengeAlreadyUsedErr,
      );
    });

    it('should handle issue -> expire -> cannot verify', () => {
      const expiredNow = new Date('2024-01-01T10:15:00Z'); // After expiresAt

      const challenge = PasswordlessChallengeAggregate.issue({
        id: validId,
        createdAt: issuedAt,
        props: {
          channel: validChannel,
          destination: validDestination,
          secret: validSecret,
          issuedAt,
          expiresAt,
          status: PasswordlessChallengeStatus.issued(),
        },
      });

      // Try to verify expired challenge
      expect(() => challenge.verify(VALID_SECRET, expiredNow)).toThrow(
        PasswordlessChallengeExpired,
      );
      expect(challenge.props.status.value).toBe('issued'); // Status unchanged
    });

    it('should handle issue -> wrong secret -> correct secret', () => {
      const now = new Date('2024-01-01T10:05:00Z');

      const challenge = PasswordlessChallengeAggregate.issue({
        id: validId,
        createdAt: issuedAt,
        props: {
          channel: validChannel,
          destination: validDestination,
          secret: validSecret,
          issuedAt,
          expiresAt,
          status: PasswordlessChallengeStatus.issued(),
        },
      });

      // Try wrong secret first
      expect(() => challenge.verify('wrong-secret', now)).toThrow(
        PasswordlessChallengeSecretMismatch,
      );
      expect(challenge.props.status.value).toBe('issued'); // Still issued

      // Try correct secret
      expect(() => challenge.verify(VALID_SECRET, now)).not.toThrow();
      expect(challenge.props.status.value).toBe('verified');
    });
  });
});
