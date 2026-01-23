import { PasswordlessChallenge } from '@/domain/aggregates/passwordless-challenge.aggregate';
import { PasswordlessChallengeId } from '@/domain/value-objects/passwordless-challenge-id.vo';
import { Email } from '@rineex/ddd';

export interface PasswordlessSessionRepository {
  save(challenge: PasswordlessChallenge): Promise<void>;
  findById(id: PasswordlessChallengeId): Promise<PasswordlessChallenge | null>;
  findActiveByEmail(email: Email): Promise<PasswordlessChallenge | null>;
}
