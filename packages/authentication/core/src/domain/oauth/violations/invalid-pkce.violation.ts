import { AuthDomainViolation } from '@/domain/violations/auth-domain.violation';

export class InvalidPkceViolation extends AuthDomainViolation {
  readonly code = 'PKCE_INVALID';
  readonly message = 'PKCE parameters are invalid';

  public static create(
    details?: Record<string, unknown>,
  ): InvalidPkceViolation {
    return new InvalidPkceViolation({ details });
  }
}
