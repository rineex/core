import { PasswordlessChallenge } from '@/domain/aggregates/passwordless-challenge.aggregate';

export type PasswordlessChallengeRepository = {
  save: (challenge: PasswordlessChallenge) => Promise<void>;
};
