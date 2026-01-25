import { AuthMethodName } from '@/types/auth-method.type';
import { AuthContext } from '@/types/auth-context.type';
import { IdentityId } from '@/domain';

/**
 * Command representing a request to start authentication.
 *
 * This is a pure use-case input.
 * It is NOT tied to HTTP, RPC, GraphQL, or CLI.
 */
export type StartAuthenticationCommand = {
  /**
   * Authentication method requested.
   * Strongly typed and autocomplete-safe.
   */
  readonly method: AuthMethodName;

  /**
   * Optional identity hint.
   * Used for passwordless, SSO, or known users.
   */
  readonly identityId: IdentityId;

  /**
   * Execution context for auditing, correlation, and risk.
   */
  readonly context: AuthContext;
};
