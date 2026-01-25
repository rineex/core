import { Email } from '@rineex/ddd';

import { PasswordlessChallengeAggregate } from '@/domain/aggregates/passwordless-challenge.aggregate';
import { PasswordlessChallengeId } from '@/domain/value-objects/passwordless-challenge-id.vo';

/**
 * Repository interface for passwordless session management.
 *
 * This interface extends the basic challenge repository with additional
 * query methods for finding challenges by ID and email.
 */
export interface PasswordlessSessionRepository {
  /**
   * Saves a passwordless challenge aggregate.
   *
   * @param {PasswordlessChallengeAggregate} challenge - The challenge aggregate to save
   * @returns {Promise<void>} Promise that resolves when the challenge is saved
   */
  save: (challenge: PasswordlessChallengeAggregate) => Promise<void>;

  /**
   * Finds a passwordless challenge by its ID.
   *
   * @param {PasswordlessChallengeId} id - The challenge ID to search for
   * @returns {Promise<PasswordlessChallengeAggregate | null>} The challenge if found, null otherwise
   */
  findById: (
    id: PasswordlessChallengeId,
  ) => Promise<PasswordlessChallengeAggregate | null>;

  /**
   * Finds an active passwordless challenge by email address.
   *
   * @param {Email} email - The email address to search for
   * @returns {Promise<PasswordlessChallengeAggregate | null>} The active challenge if found, null otherwise
   */
  findActiveByEmail: (
    email: Email,
  ) => Promise<PasswordlessChallengeAggregate | null>;
}
