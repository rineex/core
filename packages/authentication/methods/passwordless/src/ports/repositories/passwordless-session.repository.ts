import { PasswordlessChallengeAggregate } from '@/domain/aggregates/passwordless-challenge.aggregate';
import { PasswordlessChallengeId } from '@/domain/value-objects/passwordless-challenge-id.vo';
import { Email } from '@rineex/ddd';

export interface PasswordlessSessionRepository {
  save(challenge: PasswordlessChallengeAggregate): Promise<void>;
  findById(
    id: PasswordlessChallengeId,
  ): Promise<PasswordlessChallengeAggregate | null>;
  findActiveByEmail(
    email: Email,
  ): Promise<PasswordlessChallengeAggregate | null>;
}
