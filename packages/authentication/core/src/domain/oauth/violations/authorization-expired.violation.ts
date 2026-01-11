import { AuthDomainViolation } from '@/domain/violations/auth-domain.violation';
import { DomainErrorType } from '@rineex/ddd';

export class AuthorizationExpiredViolation extends AuthDomainViolation {
  readonly code = 'oauth.authorization.expired';
  readonly message = 'The OAuth authorization has expired';
  type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  public static create(): AuthorizationExpiredViolation {
    return new AuthorizationExpiredViolation();
  }
}
