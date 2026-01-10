import { DomainErrorType } from '@rineex/ddd';

import { AuthDomainViolation } from './auth-domain.violation';

/**
 * Raised when an authentication token violates domain invariants.
 */
export class InvalidAuthTokenViolation extends AuthDomainViolation {
  readonly code = 'AUTH_TOKEN_INVALID';
  readonly message = 'Authentication token is invalid';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  public static create(payload: { actualLength: number; minLength: number }) {
    return new InvalidAuthTokenViolation({ ...payload });
  }
}
