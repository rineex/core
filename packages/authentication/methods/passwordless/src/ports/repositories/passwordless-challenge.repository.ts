import { PasswordlessChallengeAggregate } from '@/domain/aggregates/passwordless-challenge.aggregate';

/**
 * Repository port for persisting passwordless challenge aggregates.
 *
 * This port defines the contract for storing and retrieving passwordless challenges.
 * Implementations should handle persistence concerns (database, cache, etc.).
 */
export type PasswordlessChallengeRepository = {
  /**
   * Saves a passwordless challenge aggregate.
   *
   * @param {PasswordlessChallengeAggregate} challenge - The challenge aggregate to save
   * @returns {Promise<void>} Promise that resolves when the challenge is saved
   */
  save: (challenge: PasswordlessChallengeAggregate) => Promise<void>;
};
