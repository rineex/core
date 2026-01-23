import { AuthDomainViolation } from '@/domain/violations/auth-domain.violation';
import { DomainErrorType } from '@rineex/ddd';

export class AuthorizationAlreadyUsedViolation extends AuthDomainViolation {
  readonly code = 'oauth.authorization.already_used';
  readonly message = 'The OAuth authorization has already been used';
  type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  public static create(): AuthorizationAlreadyUsedViolation {
    return new AuthorizationAlreadyUsedViolation();
  }
}
