import { Result } from '@rineex/ddd';

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
      props: {
        expiresAt: overrides?.expiresAt ?? expiresAt,
        status: PasswordlessChallengeStatus.issued(),
        secret: overrides?.secret ?? validSecret,
        destination: validDestination,
        channel: validChannel,
        issuedAt,
      },
      createdAt: issuedAt,
      id: validId,
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
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
    };

    service = new VerifyPasswordlessChallengeService(mockRepository);
  });

  describe('execute', () => {
    it('should successfully verify a valid challenge', async () => {
      const challenge = createIssuedChallenge();
      vi.mocked(mockRepository.findById).mockResolvedValue(challenge);

      const result = await service.execute({
        secret: validSecret,
        id: validId,
      });

      expect(Result.isOk(result)).toBe(true);

      if (!Result.isOk(result)) {
        throw new Error('expected ok');
      }

      expect(result.value).toBeInstanceOf(PasswordlessChallengeAggregate);
      expect(mockRepository.findById).toHaveBeenCalledWith(VALID_UUID);
      expect(mockRepository.save).toHaveBeenCalledOnce();
      expect(mockRepository.save).toHaveBeenCalledWith(challenge);
    });

    it('should return Result.err with PasswordlessChallengeNotFoundError when challenge is not found', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      const result = await service.execute({
        secret: validSecret,
        id: validId,
      });

      expect(Result.isErr(result)).toBe(true);

      if (!Result.isErr(result)) {
        throw new Error('expected err');
      }

      expect(result.error).toBeInstanceOf(PasswordlessChallengeNotFoundError);
      expect(mockRepository.findById).toHaveBeenCalledWith(VALID_UUID);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should return Result.err with PasswordlessChallengeExpiredError when challenge is expired', async () => {
      const pastIssuedAt = new Date('2020-01-01T10:00:00Z');
      const pastExpiresAt = new Date('2020-01-01T10:00:01Z');
      const expiredChallenge = PasswordlessChallengeAggregate.issue({
        props: {
          status: PasswordlessChallengeStatus.issued(),
          destination: validDestination,
          expiresAt: pastExpiresAt,
          issuedAt: pastIssuedAt,
          channel: validChannel,
          secret: validSecret,
        },
        createdAt: pastIssuedAt,
        id: validId,
      });

      vi.mocked(mockRepository.findById).mockResolvedValue(expiredChallenge);

      const result = await service.execute({
        secret: validSecret,
        id: validId,
      });

      expect(Result.isErr(result)).toBe(true);

      if (!Result.isErr(result)) {
        throw new Error('expected err');
      }

      expect(result.error).toBeInstanceOf(PasswordlessChallengeExpiredError);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should return Result.err with PasswordlessChallengeSecretMismatchError when secret does not match', async () => {
      const challenge = createIssuedChallenge();
      vi.mocked(mockRepository.findById).mockResolvedValue(challenge);

      const result = await service.execute({
        secret: wrongSecret,
        id: validId,
      });

      expect(Result.isErr(result)).toBe(true);

      if (!Result.isErr(result)) {
        throw new Error('expected err');
      }

      expect(result.error).toBeInstanceOf(
        PasswordlessChallengeSecretMismatchError,
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should return Result.err when challenge is already verified (verify throws)', async () => {
      const challenge = createIssuedChallenge();
      challenge.verify(validSecret.value, new Date());
      vi.mocked(mockRepository.findById).mockResolvedValue(challenge);

      const result = await service.execute({
        secret: validSecret,
        id: validId,
      });

      expect(Result.isErr(result)).toBe(true);

      if (!Result.isErr(result)) {
        throw new Error('expected err');
      }

      expect(result.error).toBeInstanceOf(
        PasswordlessChallengeAlreadyUsedError,
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should return Result.err when repository findById throws', async () => {
      const error = new Error('Database connection failed');
      vi.mocked(mockRepository.findById).mockRejectedValue(error);

      const result = await service.execute({
        secret: validSecret,
        id: validId,
      });

      expect(Result.isErr(result)).toBe(true);

      if (!Result.isErr(result)) {
        throw new Error('expected err');
      }

      expect(result.error).toBe(error);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should return Result.err when repository save throws', async () => {
      const challenge = createIssuedChallenge();
      vi.mocked(mockRepository.findById).mockResolvedValue(challenge);
      const error = new Error('Save failed');
      vi.mocked(mockRepository.save).mockRejectedValue(error);

      const result = await service.execute({
        secret: validSecret,
        id: validId,
      });

      expect(Result.isErr(result)).toBe(true);

      if (!Result.isErr(result)) {
        throw new Error('expected err');
      }

      expect(result.error).toBe(error);
      expect(mockRepository.save).toHaveBeenCalledWith(challenge);
    });

    it('should persist the verified challenge via repository', async () => {
      const challenge = createIssuedChallenge();
      vi.mocked(mockRepository.findById).mockResolvedValue(challenge);

      await service.execute({
        secret: validSecret,
        id: validId,
      });

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
      const challenge = createIssuedChallenge();
      vi.mocked(mockRepository.findById).mockResolvedValue(challenge);

      await service.execute({
        secret: validSecret,
        id: validId,
      });

      expect(mockRepository.findById).toHaveBeenCalledWith(validId.value);
    });
  });
});
