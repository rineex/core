import { AuthToken } from './auth-token.vo';

/**
 * Token bound to a session lifecycle.
 */
export class SessionToken extends AuthToken {
  readonly type = 'session';

  public static create(value: string): SessionToken {
    return new SessionToken(value);
  }
}
