import { AuthMethod } from '@/domain/identity/value-objects';
import { AuthContext } from '@/types/auth-context.type';

/**
 * Contract implemented by authentication method modules.
 *
 * Examples:
 * - OTP
 * - OAuth
 * - Passkeys
 *
 * Auth-core depends on this abstraction, not implementations.
 */
export type AuthMethodPort = {
  readonly method: AuthMethod;

  authenticate: (context: AuthContext) => Promise<void>;
};
