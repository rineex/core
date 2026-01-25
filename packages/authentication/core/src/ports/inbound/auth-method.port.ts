import { DomainError } from '@rineex/ddd';

import { AuthAttemptId } from '@/domain/identity/value-objects';
import { AuthMethodName } from '@/types';

/**
 * Outcome of executing an authentication method step.
 *
 * - `ok` → step accepted
 * - `violation` → domain rule violated
 *
 * This is NOT Result<T>.
 * Result is application-level.
 */
export type AuthMethodOutcome =
  | { readonly ok: false; readonly violation: DomainError }
  | { readonly ok: true };

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
// export type AuthMethodPort = {
//   readonly method: AuthMethod;

//   authenticate: (context: AuthContext) => Promise<void>;
// };

/**
 * Contract implemented by all authentication method modules.
 *
 * Installed via npm and registered at runtime.
 */
export type AuthMethodPort = {
  /**
   * Unique method identifier (passwordless, otp, oauth, etc).
   */
  readonly method: AuthMethodName;

  /**
   * Initiates the authentication flow for this method.
   *
   * Example:
   * - send email
   * - redirect to oauth provider
   * - issue challenge
   */
  start: (params: {
    authAttemptId: AuthAttemptId;
    ctx: unknown;
  }) => AuthMethodOutcome;

  /**
   * Verifies a response for this method.
   *
   * Example:
   * - magic link token
   * - otp code
   * - oauth callback
   */
  verify: (params: {
    authAttemptId: AuthAttemptId;
    payload: unknown;
  }) => AuthMethodOutcome;
};
