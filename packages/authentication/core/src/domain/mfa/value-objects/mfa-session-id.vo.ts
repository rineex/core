import { DomainID } from '@rineex/ddd';

/**
 * Represents the unique identifier for an MFA session.
 *
 * @remarks
 * This is a domain-specific identifier that extends DomainID.
 * Used to uniquely identify MFA sessions within the authentication domain.
 *
 * @example
 * ```typescript
 * // Generate a new session ID
 * const sessionId = MfaSessionId.generate();
 *
 * // Create from string
 * const sessionId = MfaSessionId.fromString('session_123');
 * ```
 */
export class MfaSessionId extends DomainID {}
