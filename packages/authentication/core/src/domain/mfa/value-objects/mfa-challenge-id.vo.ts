import { DomainID } from '@rineex/ddd';

/**
 * Represents the unique identifier for an MFA challenge.
 *
 * @remarks
 * This is a domain-specific identifier that extends DomainID.
 * Used to uniquely identify MFA challenges within the authentication domain.
 *
 * @example
 * ```typescript
 * // Generate a new challenge ID
 * const challengeId = MfaChallengeId.generate();
 *
 * // Create from string
 * const challengeId = MfaChallengeId.fromString('challenge_123');
 * ```
 */
export class MfaChallengeId extends DomainID {}
