import { AuthDomainViolation } from '@/domain/violations/auth-domain.violation';
import { PrimitiveValueObject } from '@rineex/ddd';

class InvalidMfaSessionIdViolation extends AuthDomainViolation {
  readonly code = 'MFA_SESSION_ID_INVALID';
  readonly message = 'MFA session ID is invalid';

  static create(props: { value: string }) {
    return new InvalidMfaSessionIdViolation(props);
  }
}

export class MfaSessionId extends PrimitiveValueObject<string> {
  protected validate(value: string): void {
    if (!value || value.length < 16) {
      throw InvalidMfaSessionIdViolation.create({ value });
    }
  }
}
