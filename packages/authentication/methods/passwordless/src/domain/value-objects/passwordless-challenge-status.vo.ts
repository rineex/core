import { PrimitiveValueObject } from '@rineex/ddd';

export type PasswordlessChallengeStatusType = 'issued' | 'verified' | 'expired';

export class PasswordlessChallengeStatus extends PrimitiveValueObject<PasswordlessChallengeStatusType> {
  protected validate(value: PasswordlessChallengeStatusType): void {
    // closed union, no runtime validation needed
  }

  public static issued(): PasswordlessChallengeStatus {
    return new PasswordlessChallengeStatus('issued');
  }

  public static verified(): PasswordlessChallengeStatus {
    return new PasswordlessChallengeStatus('verified');
  }

  public static expired(): PasswordlessChallengeStatus {
    return new PasswordlessChallengeStatus('expired');
  }

  public isFinal(): boolean {
    return this.value === 'verified' || this.value === 'expired';
  }
}
