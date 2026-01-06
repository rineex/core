import { AuthDomainViolation } from '@/domain/violations/auth-domain.violation';

export class InvalidAuthorizationCodeViolation extends AuthDomainViolation {
  readonly code = 'AUTH_CODE_INVALID';
  readonly message = 'Authorization code is invalid';

  public static create(
    details?: Record<string, unknown>,
  ): InvalidAuthorizationCodeViolation {
    return new InvalidAuthorizationCodeViolation({ details });
  }
}
