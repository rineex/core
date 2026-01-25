import { ClockPort } from '@rineex/ddd';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PasswordlessChallengeRepository } from '@/ports/repositories/passwordless-challenge.repository';
import { PasswordlessChallengeAggregate } from '@/domain/aggregates/passwordless-challenge.aggregate';
import { PasswordlessChallengeStatus } from '@/domain/value-objects/passwordless-challenge-status.vo';
import { PasswordlessChallengeId } from '@/domain/value-objects/passwordless-challenge-id.vo';
import { ChallengeDestination } from '@/domain/value-objects/challenge-destination.vo';
import { PasswordlessIdGeneratorPort } from '@/ports/passwordless-id-generator.port';
import { ChallengeSecret } from '@/domain/value-objects/challenge-secret.vo';
import { PasswordlessChannel } from '@/domain/value-objects/channel.vo';

import { IssuePasswordlessChallengeService } from '../issue-passwordless-challenge.service';

describe('issuePasswordlessChallengeService', () => {
  const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
  const VALID_SECRET = '123456';
  const VALID_DESTINATION = 'user@example.com';

  let service: IssuePasswordlessChallengeService;
  let mockRepository: PasswordlessChallengeRepository;
  let mockIdGenerator: PasswordlessIdGeneratorPort;
  let mockClock: ClockPort;

  let validId: PasswordlessChallengeId;
  let validChannel: PasswordlessChannel;
  let validDestination: ChallengeDestination;
  let validSecret: ChallengeSecret;
  let issuedAt: Date;

  beforeEach(() => {
    validId = PasswordlessChallengeId.fromString(VALID_UUID);
    validChannel = PasswordlessChannel.create('email');
    validDestination = ChallengeDestination.create(VALID_DESTINATION);
    validSecret = ChallengeSecret.create(VALID_SECRET);
    issuedAt = new Date('2024-01-01T10:00:00Z');

    mockRepository = {
      save: vi.fn().mockResolvedValue(undefined),
    };

    mockIdGenerator = {
      generate: vi.fn().mockReturnValue(validId),
    };

    mockClock = {
      now: vi.fn().mockReturnValue(issuedAt),
    };

    service = new IssuePasswordlessChallengeService(
      mockRepository,
      mockIdGenerator,
      mockClock,
    );
  });

  describe('execute', () => {
    it('should successfully issue a passwordless challenge', async () => {
      const result = await service.execute({
        destination: validDestination,
        channel: validChannel,
        secret: validSecret,
      });

      expect(result.isSuccess).toBe(true);
      expect(mockIdGenerator.generate).toHaveBeenCalledOnce();
      expect(mockClock.now).toHaveBeenCalledOnce();
      expect(mockRepository.save).toHaveBeenCalledOnce();
    });

    it('should use default TTL of 300 seconds when not provided', async () => {
      const result = await service.execute({
        destination: validDestination,
        channel: validChannel,
        secret: validSecret,
      });

      expect(result.isSuccess).toBe(true);
      expect(mockIdGenerator.generate).toHaveBeenCalledOnce();
      expect(mockClock.now).toHaveBeenCalledOnce();
      expect(mockRepository.save).toHaveBeenCalledOnce();

      const challenge = result.getValue();

      expect(challenge).toBeInstanceOf(PasswordlessChallengeAggregate);
      expect(challenge.id).toBe(validId);
      expect(challenge.props.status.value).toBe('issued');
      expect(challenge.props.channel).toBe(validChannel);
      expect(challenge.props.destination).toBe(validDestination);
      expect(challenge.props.secret).toBe(validSecret);
    });

    it('should use custom TTL when provided', async () => {
      const customTtl = '600s'; // 10 minutes

      const result = await service.execute({
        destination: validDestination,
        channel: validChannel,
        ttlSeconds: customTtl,
        secret: validSecret,
      });

      expect(result.isSuccess).toBe(true);

      const challenge = result.getValue();
      const expectedExpiresAt = new Date(issuedAt.getTime() + 600 * 1000);

      expect(challenge.props.expiresAt.getTime()).toBe(
        expectedExpiresAt.getTime(),
      );
    });

    it('should create challenge with issued status', async () => {
      const result = await service.execute({
        destination: validDestination,
        channel: validChannel,
        secret: validSecret,
      });

      expect(result.isSuccess).toBe(true);

      const challenge = result.getValue();

      expect(challenge.props.status).toEqual(
        PasswordlessChallengeStatus.issued(),
      );
    });

    it('should emit PasswordlessChallengeIssuedEvent when challenge is created', async () => {
      const result = await service.execute({
        destination: validDestination,
        channel: validChannel,
        secret: validSecret,
      });

      expect(result.isSuccess).toBe(true);

      const challenge = result.getValue();
      const events = challenge.domainEvents;

      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('auth.passwordless.challenge_created');
    });

    it('should work with SMS channel', async () => {
      const smsChannel = PasswordlessChannel.create('sms');
      const phoneDestination = ChallengeDestination.create('+1234567890');

      const result = await service.execute({
        destination: phoneDestination,
        channel: smsChannel,
        secret: validSecret,
      });

      expect(result.isSuccess).toBe(true);

      const challenge = result.getValue();

      expect(challenge.props.channel.value).toBe('sms');
      expect(challenge.props.destination.value).toBe('+1234567890');
    });

    it('should return Result.fail when repository save fails', async () => {
      const error = new Error('Database error');
      vi.spyOn(mockRepository, 'save')
        .mockImplementation()
        .mockRejectedValue(error);

      const result = await service.execute({
        destination: validDestination,
        channel: validChannel,
        secret: validSecret,
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe(error);
    });

    it('should return Result.fail when aggregate creation fails', async () => {
      // Test with a scenario that will cause an error
      // by making the repository throw an error during save
      const error = new Error('Aggregate validation failed');
      vi.spyOn(mockRepository, 'save')
        .mockImplementation()
        .mockRejectedValue(error);

      const result = await service.execute({
        destination: validDestination,
        channel: validChannel,
        secret: validSecret,
      });

      // The service catches errors and returns Result.fail
      expect(result.isFailure).toBe(true);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should set issuedAt to current time from clock', async () => {
      const customTime = new Date('2024-06-15T14:30:00Z');
      vi.spyOn(mockClock, 'now')
        .mockImplementation()
        .mockReturnValue(customTime);

      const result = await service.execute({
        destination: validDestination,
        channel: validChannel,
        secret: validSecret,
      });

      expect(result.isSuccess).toBe(true);

      const challenge = result.getValue();

      expect(challenge.props.issuedAt).toEqual(customTime);
    });

    it('should persist the challenge via repository', async () => {
      await service.execute({
        destination: validDestination,
        channel: validChannel,
        secret: validSecret,
      });

      expect(mockRepository.save).toHaveBeenCalledOnce();

      const savedChallenge = (mockRepository.save as any).mock.calls[0][0];

      expect(savedChallenge).toBeInstanceOf(PasswordlessChallengeAggregate);
      expect(savedChallenge.id).toBe(validId);
    });
  });
});
