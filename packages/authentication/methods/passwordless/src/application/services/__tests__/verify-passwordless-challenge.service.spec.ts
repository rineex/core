import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ChallengeDestination,
  ChallengeSecret,
  PasswordlessChallengeAggregate,
  PasswordlessChallengeAlreadyUsedError,
  PasswordlessChallengeExpiredError,
  PasswordlessChallengeId,
  PasswordlessChallengeNotFoundError,
  PasswordlessChallengeSecretMismatchError,
  PasswordlessChallengeStatus,
  PasswordlessChannel,
} from '@/domain';
import { PasswordlessChallengeRepository } from '@/ports';

import { VerifyPasswordlessChallengeService } from '../verify-passwordless-challenge.service';

describe('verifyPasswordlessChallengeService', () => {
  const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
  const VALID_SECRET = '123456';
  const WRONG_SECRET = '654321';
  const VALID_DESTINATION = 'user@example.com';

  let service: VerifyPasswordlessChallengeService;
  let mockRepository: PasswordlessChallengeRepository;

  let validId: PasswordlessChallengeId;
  let validChannel: PasswordlessChannel;
  let validDestination: ChallengeDestination;
  let validSecret: ChallengeSecret;
  let wrongSecret: ChallengeSecret;
  let issuedAt: Date;
  let expiresAt: Date;

  /** Creates a challenge that is not expired at test run time. */
  function createIssuedChallenge(overrides?: {
    expiresAt?: Date;
    secret?: ChallengeSecret;
  }): PasswordlessChallengeAggregate {
    return PasswordlessChallengeAggregate.issue({
      id: validId,
      createdAt: issuedAt,
      props: {
        channel: validChannel,
        destination: validDestination,
        secret: overrides?.secret ?? validSecret,
        issuedAt,
        expiresAt: overrides?.expiresAt ?? expiresAt,
        status: PasswordlessChallengeStatus.issued(),
      },
    });
  }

  beforeEach(() => {
    validId = PasswordlessChallengeId.fromString(VALID_UUID);
    validChannel = PasswordlessChannel.create('email');
    validDestination = ChallengeDestination.create(VALID_DESTINATION);
    validSecret = ChallengeSecret.create(VALID_SECRET);
    wrongSecret = ChallengeSecret.create(WRONG_SECRET);
    // Use relative times so challenge is valid when tests run
    const now = new Date();
    issuedAt = new Date(now.getTime() - 60_000); // 1 min ago
    expiresAt = new Date(now.getTime() + 600_000); // 10 min from now

    mockRepository = {
      findById: vi.fn(),
      save: vi.fn().mockResolvedValue(undefined),
    };

    service = new VerifyPasswordlessChallengeService(mockRepository);
  });

  describe('execute', () => {
    it('should successfully verify a valid challenge', async () => {
      // Arrange
      const challenge = createIssuedChallenge();
      vi.mocked(mockRepository.findById).mockResolvedValue(challenge);

      // Act
      const result = await service.execute({
        id: validId,
        secret: validSecret,
      });

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(challenge);
      expect(mockRepository.findById).toHaveBeenCalledWith(VALID_UUID);
      expect(mockRepository.save).toHaveBeenCalledOnce();
      expect(mockRepository.save).toHaveBeenCalledWith(challenge);
    });

    it('should return Result.fail with PasswordlessChallengeNotFoundError when challenge is not found', async () => {
      // Arrange
      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      // Act
      const result = await service.execute({
        id: validId,
        secret: validSecret,
      });

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBeInstanceOf(
        PasswordlessChallengeNotFoundError,
      );
      expect(mockRepository.findById).toHaveBeenCalledWith(VALID_UUID);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should return Result.fail with PasswordlessChallengeExpiredError when challenge is expired', async () => {
      // Arrange: challenge with expiresAt in the past so isExpired() is true when service runs
      const pastIssuedAt = new Date('2020-01-01T10:00:00Z');
      const pastExpiresAt = new Date('2020-01-01T10:00:01Z');
      const expiredChallenge = PasswordlessChallengeAggregate.issue({
        id: validId,
        createdAt: pastIssuedAt,
        props: {
          channel: validChannel,
          destination: validDestination,
          secret: validSecret,
          issuedAt: pastIssuedAt,
          expiresAt: pastExpiresAt,
          status: PasswordlessChallengeStatus.issued(),
        },
      });

      vi.mocked(mockRepository.findById).mockResolvedValue(expiredChallenge);

      // Act
      const result = await service.execute({
        id: validId,
        secret: validSecret,
      });

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBeInstanceOf(
        PasswordlessChallengeExpiredError,
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should return Result.fail with PasswordlessChallengeSecretMismatchError when secret does not match', async () => {
      // Arrange
      const challenge = createIssuedChallenge();
      vi.mocked(mockRepository.findById).mockResolvedValue(challenge);

      // Act
      const result = await service.execute({
        id: validId,
        secret: wrongSecret,
      });

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBeInstanceOf(
        PasswordlessChallengeSecretMismatchError,
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should return Result.fail when challenge is already verified (verify throws)', async () => {
      // Arrange: create issued challenge, then verify it so it becomes "already used"
      const challenge = createIssuedChallenge();
      challenge.verify(validSecret.value, new Date());
      vi.mocked(mockRepository.findById).mockResolvedValue(challenge);

      // Act
      const result = await service.execute({
        id: validId,
        secret: validSecret,
      });

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBeInstanceOf(
        PasswordlessChallengeAlreadyUsedError,
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should return Result.fail when repository findById throws', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      vi.mocked(mockRepository.findById).mockRejectedValue(error);

      // Act
      const result = await service.execute({
        id: validId,
        secret: validSecret,
      });

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe(error);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should return Result.fail when repository save throws', async () => {
      // Arrange
      const challenge = createIssuedChallenge();
      vi.mocked(mockRepository.findById).mockResolvedValue(challenge);
      const error = new Error('Save failed');
      vi.mocked(mockRepository.save).mockRejectedValue(error);

      // Act
      const result = await service.execute({
        id: validId,
        secret: validSecret,
      });

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe(error);
      expect(mockRepository.save).toHaveBeenCalledWith(challenge);
    });

    it('should persist the verified challenge via repository', async () => {
      // Arrange
      const challenge = createIssuedChallenge();
      vi.mocked(mockRepository.findById).mockResolvedValue(challenge);

      // Act
      await service.execute({
        id: validId,
        secret: validSecret,
      });

      // Assert
      expect(mockRepository.save).toHaveBeenCalledOnce();
      const savedChallenge = vi.mocked(mockRepository.save).mock.calls[0][0];
      expect(savedChallenge).toBe(challenge);
      expect(
        savedChallenge.domainEvents.some(
          e => e.eventName === 'auth.passwordless.challenge_verified',
        ),
      ).toBe(true);
    });

    it('should call findById with id value', async () => {
      // Arrange
      const challenge = createIssuedChallenge();
      vi.mocked(mockRepository.findById).mockResolvedValue(challenge);

      // Act
      await service.execute({
        id: validId,
        secret: validSecret,
      });

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(validId.value);
    });
  });
});
