import { AuthDomainViolation } from '@/domain/violations/auth-domain.violation';

export class AuthorizationExpiredViolation extends AuthDomainViolation {
  readonly code = 'oauth.authorization.expired';
  readonly message = 'The OAuth authorization has expired';

  public static create(): AuthorizationExpiredViolation {
    return new AuthorizationExpiredViolation();
  }
}
