import { PasswordlessChallengeId } from '@/domain/value-objects';

/**
 * Port for generating passwordless challenge identifiers.
 *
 * This port abstracts the ID generation strategy, allowing different
 * implementations (ULID, UUIDv7, KSUID, etc.) without the domain
 * layer needing to know the specific implementation.
 *
 * @example
 * ```typescript
 * const idGenerator: PasswordlessIdGeneratorPort = {
 *   generate: () => PasswordlessChallengeId.fromString(uuidv7()),
 * };
 * ```
 */
export type PasswordlessIdGeneratorPort = {
  /**
   * Generates a new passwordless challenge identifier.
   *
   * @returns {PasswordlessChallengeId} A new unique challenge ID
   */
  generate: () => PasswordlessChallengeId;
};
