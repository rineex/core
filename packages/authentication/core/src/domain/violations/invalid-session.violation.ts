import { DomainErrorType } from '@rineex/ddd';

import { AuthDomainViolation } from './auth-domain.violation';

/**
 * Raised when a session invariant is violated.
 */
export class InvalidSessionViolation extends AuthDomainViolation {
  readonly code = 'session.invalid';
  readonly message = 'Session state is invalid';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  public static create(): InvalidSessionViolation {
    return new InvalidSessionViolation();
  }
}
