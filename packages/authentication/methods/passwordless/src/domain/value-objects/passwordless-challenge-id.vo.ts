import { DomainID } from '@rineex/ddd';

/**
 * Unique identifier for a passwordless authentication challenge.
 *
 * This value object extends DomainID and represents the unique identifier
 * for a passwordless challenge aggregate.
 *
 * @example
 * ```typescript
 * const challengeId = PasswordlessChallengeId.fromString('550e8400-e29b-41d4-a716-446655440000');
 * ```
 */
export class PasswordlessChallengeId extends DomainID {}
