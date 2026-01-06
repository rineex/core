import { MfaSessionId } from '@/domain/mfa/value-objects/mfa-session-id.vo';

/**
 * Generates MFA session identifiers.
 *
 * Examples:
 * - ULID
 * - UUIDv7
 * - KSUID
 *
 * Domain does NOT care.
 */
export type MfaSessionIdGenerator = {
  generate: () => MfaSessionId;
};
