import { AuthDomainViolation } from '@/domain/violations/auth-domain.violation';

export class AuthorizationAlreadyUsedViolation extends AuthDomainViolation {
  readonly code = 'oauth.authorization.already_used';
  readonly message = 'The OAuth authorization has already been used';

  public static create(): AuthorizationAlreadyUsedViolation {
    return new AuthorizationAlreadyUsedViolation();
  }
}
