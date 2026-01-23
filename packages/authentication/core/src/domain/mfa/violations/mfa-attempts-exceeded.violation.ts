import { DomainViolation } from '@rineex/ddd';

export class MfaAttemptsExceededViolation extends DomainViolation {
  readonly code = 'MFA_ATTEMPTS_EXCEEDED';
  readonly message = 'Maximum MFA verification attempts exceeded';

  protected constructor(attemptsUsed: number, maxAttempts: number) {
    super({ attemptsUsed, maxAttempts });
  }

  static create(
    attemptsUsed: number,
    maxAttempts: number,
  ): MfaAttemptsExceededViolation {
    return new MfaAttemptsExceededViolation(attemptsUsed, maxAttempts);
  }
}
