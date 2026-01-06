import { AuthToken } from './auth-token.vo';

/**
 * Token bound to a session lifecycle.
 */
export class SessionToken extends AuthToken {
  get type() {
    return 'session';
  }

  public static create(value: string): SessionToken {
    return new SessionToken(value);
  }
}
