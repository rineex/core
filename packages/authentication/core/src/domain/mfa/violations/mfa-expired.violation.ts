import { DomainViolation } from '@rineex/ddd';

export class MfaExpiredViolation extends DomainViolation {
  readonly code = 'MFA_EXPIRED';
  readonly message = 'MFA challenge or session has expired';

  static create() {
    return new MfaExpiredViolation();
  }
}
