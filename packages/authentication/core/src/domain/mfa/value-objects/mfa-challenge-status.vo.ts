import { AuthDomainViolation } from '@/domain/violations/auth-domain.violation';
import { DomainErrorType, PrimitiveValueObject } from '@rineex/ddd';

const AllowedStatuses = ['pending', 'verified', 'expired', 'failed'] as const;

type MfaChallengeStatusValue = (typeof AllowedStatuses)[number];

class InvalidMfaChallengeStatusViolation extends AuthDomainViolation {
  readonly code = 'MFA_CHALLENGE_STATUS_INVALID';
  readonly message = 'MFA challenge status is invalid';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  static create(value: MfaChallengeStatusValue) {
    return new InvalidMfaChallengeStatusViolation({ value });
  }
}

export class MfaChallengeStatus extends PrimitiveValueObject<MfaChallengeStatusValue> {
  static pending() {
    return new MfaChallengeStatus('pending');
  }

  static verified() {
    return new MfaChallengeStatus('verified');
  }

  protected validate(value: MfaChallengeStatusValue): void {
    if (!AllowedStatuses.includes(value)) {
      throw InvalidMfaChallengeStatusViolation.create(value);
    }
  }
}
