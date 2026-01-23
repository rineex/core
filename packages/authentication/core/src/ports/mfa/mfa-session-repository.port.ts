import { MfaSessionId } from '@/domain/mfa/value-objects/mfa-session-id.vo';
import { MFASession } from '@/domain/mfa/aggregates/mfa-session.aggregate';
import { IdentityId } from '@/domain';

/**
 * Persistence port for MFA sessions.
 *
 * Implementations may use:
 * - SQL
 * - NoSQL
 * - Redis
 * - In-memory
 *
 * Domain MUST NOT know which.
 */
export type MfaSessionRepository = {
  /**
   * Find MFA session by aggregate id.
   */
  findById: (id: MfaSessionId) => Promise<MFASession | null>;

  /**
   * Find active MFA session for an identity.
   */
  findActiveByIdentity: (identityId: IdentityId) => Promise<MFASession | null>;

  /**
   * Persist MFA session state.
   */
  save: (session: MFASession) => Promise<void>;
};
