import { DomainID } from '@rineex/ddd';

/**
 * Represents a globally unique identifier for an authentication attempt.
 *
 * This ID is used for:
 * - Correlation across logs
 * - Event causation
 * - Security auditing
 *
 */
export class AuthAttemptId extends DomainID {}
