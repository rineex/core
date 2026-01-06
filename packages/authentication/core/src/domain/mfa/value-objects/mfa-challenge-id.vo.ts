import { AuthDomainViolation } from '@/domain/violations/auth-domain.violation';
import { PrimitiveValueObject } from '@rineex/ddd';

class InvalidMfaChallengeIdViolation extends AuthDomainViolation {
  readonly code = 'MFA_CHALLENGE_ID_INVALID';
  readonly message = 'MFA challenge ID is invalid';

  static create(props: { value: string }) {
    return new InvalidMfaChallengeIdViolation(props);
  }
}

export class MfaChallengeId extends PrimitiveValueObject<string> {
  protected validate(value: string): void {
    if (!value || value.length < 16) {
      throw InvalidMfaChallengeIdViolation.create({ value });
    }
  }
}
