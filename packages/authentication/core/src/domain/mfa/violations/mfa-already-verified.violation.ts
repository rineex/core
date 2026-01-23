import { DomainViolation } from '@rineex/ddd';

export class MfaAlreadyVerifiedViolation extends DomainViolation {
  readonly code = 'MFA_ALREADY_VERIFIED';
  readonly message = 'MFA session is already verified';

  static create(): MfaAlreadyVerifiedViolation {
    return new MfaAlreadyVerifiedViolation();
  }
}
