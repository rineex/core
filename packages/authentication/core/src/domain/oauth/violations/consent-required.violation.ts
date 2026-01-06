import { AuthDomainViolation } from '@/domain/violations/auth-domain.violation';

export class ConsentRequiredViolation extends AuthDomainViolation {
  readonly code = 'oauth.consent.required';
  readonly message = 'User consent is required for this OAuth authorization';

  public static create(): ConsentRequiredViolation {
    return new ConsentRequiredViolation();
  }
}
