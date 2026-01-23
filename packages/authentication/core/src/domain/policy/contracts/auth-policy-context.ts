import { AuthMethod, IdentityId } from '@/domain/identity/value-objects';

/**
 * Immutable context passed to all authentication policies.
 * Represents facts, not decisions.
 */
export type AuthPolicyContext = Readonly<{
  readonly identityId?: IdentityId;
  readonly method: AuthMethod;

  /**
   * Pre-calculated risk score (0-100).
   * Produced by an upstream adapter (not domain logic).
   */
  readonly riskScore?: number;

  /**
   * Whether the identity is already known to be blocked.
   */
  readonly isBlocked?: boolean;

  /**
   * True if this authentication attempt is coming
   * from a previously trusted environment.
   */
  readonly isTrustedDevice?: boolean;
}>;
