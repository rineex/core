import { AggregateRoot, CreateEntityProps } from '@rineex/ddd';
import { defaultIfBlank } from '@/utils/default-if-blank.util';
import { IdentityId } from '@/index';

import { MfaActiveChallengeExistsViolation } from '../violations/mfa-active-challenge-exists.violation';
import { MfaAttemptsExceededViolation } from '../violations/mfa-attempts-exceeded.violation';
import { MfaAlreadyVerifiedViolation } from '../violations/mfa-already-verified.violation';
import { MfaSessionId } from '../value-objects/mfa-session-id.vo';
import { MFAChallenge } from '../entities/mfa-challenge.entity';

export interface MfaSessionProps extends CreateEntityProps<MfaSessionId> {
  readonly identityId: IdentityId;
  challenges: MFAChallenge[];
  maxAttempts: number;
  attemptsUsed: number;
  verifiedAt?: Date;
}

export class MFASession extends AggregateRoot<MfaSessionId> {
  constructor(public readonly props: MfaSessionProps) {
    super(props);
  }

  toObject(): Record<string, unknown> {
    return {
      verifiedAt: defaultIfBlank(this.props.verifiedAt?.toISOString(), null),
      challenges: this.props.challenges.map(c => c.toObject()),
      identityId: this.props.identityId.toString(),
      attemptsUsed: this.props.attemptsUsed,
      maxAttempts: this.props.maxAttempts,
      id: this.id.toString(),
    };
  }

  validate(): void {
    if (this.props.attemptsUsed > this.props.maxAttempts) {
      throw MfaAttemptsExceededViolation.create(
        this.props.attemptsUsed,
        this.props.maxAttempts,
      );
    }

    if (this.props.verifiedAt && this.props.challenges.length > 0) {
      throw new Error('Verified MFA session cannot have active challenges');
    }
  }

  get isVerified(): boolean {
    return this.props.verifiedAt !== undefined;
  }

  issueChallenge(challenge: MFAChallenge, now: Date): void {
    if (this.isVerified) throw MfaAlreadyVerifiedViolation.create();

    const hasActive = this.props.challenges.some(c => !c.isExpired(now));

    if (hasActive) {
      throw MfaActiveChallengeExistsViolation.create();
    }

    this.props.challenges.push(challenge);
  }

  markAttempt(): void {
    this.props.attemptsUsed += 1;
    this.validate();
  }

  verify(now: Date): void {
    if (this.isVerified) throw MfaAlreadyVerifiedViolation.create();

    this.mutate(draft => {
      draft.props.challenges = draft.props.challenges.filter(
        c => !c.isExpired(now),
      );

      if (draft.props.challenges.length === 0) {
        throw new Error('No valid MFA challenges to verify');
      }

      draft.props.verifiedAt = now;
    });
  }
}
