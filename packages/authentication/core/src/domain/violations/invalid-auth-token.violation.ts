import { AuthDomainViolation } from './auth-domain.violation';

/**
 * Raised when an authentication token violates domain invariants.
 */
export class InvalidAuthTokenViolation extends AuthDomainViolation {
  readonly code = 'AUTH_TOKEN_INVALID';
  readonly message = 'Authentication token is invalid';

  public static create(details: { actualLength: number; minLength: number }) {
    return new InvalidAuthTokenViolation(details);
  }
}
