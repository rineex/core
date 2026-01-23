import { DomainViolation } from '@rineex/ddd';

export class MfaActiveChallengeExistsViolation extends DomainViolation {
  readonly code = 'MFA_ACTIVE_CHALLENGE_EXISTS';
  readonly message = 'An active MFA challenge already exists';

  static create(): MfaActiveChallengeExistsViolation {
    return new MfaActiveChallengeExistsViolation();
  }
}
