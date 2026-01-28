import { ApplicationServicePort, Result } from '@rineex/ddd';

import {
  PasswordlessChallengeExpiredError,
  PasswordlessChallengeNotFoundError,
  PasswordlessChallengeSecretMismatchError,
} from '@/domain/errors';
import {
  ChallengeSecret,
  PasswordlessChallengeId,
} from '@/domain/value-objects';
import { PasswordlessChallengeAggregate } from '@/domain/aggregates';
import { PasswordlessChallengeRepository } from '@/ports';

type InputProps = {
  id: PasswordlessChallengeId;
  secret: ChallengeSecret;
};

type Output = Result<PasswordlessChallengeAggregate, any>;

export class VerifyPasswordlessChallengeService implements ApplicationServicePort<
  InputProps,
  Output
> {
  constructor(private readonly repository: PasswordlessChallengeRepository) {}

  async execute({ secret, id }: InputProps): Promise<Output> {
    try {
      const challenge = await this.repository.findById(id.value);

      if (!challenge) {
        return Result.fail(PasswordlessChallengeNotFoundError.create());
      }

      if (challenge.isExpired()) {
        return Result.fail(PasswordlessChallengeExpiredError.create());
      }

      if (!challenge.matchesSecret(secret.value)) {
        return Result.fail(PasswordlessChallengeSecretMismatchError.create());
      }

      challenge.verify(secret.value, new Date());

      await this.repository.save(challenge);
      return Result.ok(challenge);
    } catch (error) {
      return Result.fail(error);
    }
  }
}
