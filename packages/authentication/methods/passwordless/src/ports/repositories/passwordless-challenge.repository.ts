import { PasswordlessChallengeAggregate } from '@/domain/aggregates/passwordless-challenge.aggregate';

export type PasswordlessChallengeRepository = {
  save: (challenge: PasswordlessChallengeAggregate) => Promise<void>;
};
