import { AuthDomainViolation } from '@/domain/violations/auth-domain.violation';
import { DomainErrorType } from '@rineex/ddd';

export class ConsentRequiredViolation extends AuthDomainViolation {
  readonly code = 'oauth.consent.required';
  readonly message = 'User consent is required for this OAuth authorization';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_VALUE';

  public static create(): ConsentRequiredViolation {
    return new ConsentRequiredViolation();
  }
}
