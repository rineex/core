import { AuthContext } from '@/types';

import { Identity } from '../aggregates/identity.aggregate';

export interface AuthenticationMethod {
  /**
   * Unique method identifier.
   * Example: 'passwordless_email', 'otp_sms', 'push'
   */
  readonly method: string;

  /**
   * Start authentication challenge.
   */
  issueChallenge: (identity: Identity, ctx: AuthContext) => Promise<void>;

  /**
   * Verify authentication challenge.
   */
  verifyChallenge: <T = unknown>(
    identity: Identity,
    payload: T,
    ctx: AuthContext,
  ) => Promise<void>;
}
