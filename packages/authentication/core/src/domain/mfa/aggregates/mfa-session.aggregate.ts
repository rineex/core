import { AggregateRoot, EntityProps } from '@rineex/ddd';
import { IdentityId } from '@/index';

import { MfaActiveChallengeExistsViolation } from '../violations/mfa-active-challenge-exists.violation';
import { MfaAttemptsExceededViolation } from '../violations/mfa-attempts-exceeded.violation';
import { MfaAlreadyVerifiedViolation } from '../violations/mfa-already-verified.violation';
import { MfaSessionId } from '../value-objects/mfa-session-id.vo';
import { MFAChallenge } from '../entities/mfa-challenge.entity';

export interface MfaSessionProps {
  readonly identityId: IdentityId;
  challenges: MFAChallenge[];
  maxAttempts: number;
  attemptsUsed: number;
  verifiedAt?: Date;
}

export class MFASession extends AggregateRoot<MfaSessionId, MfaSessionProps> {
  get isVerified(): boolean {
    return this.props.verifiedAt !== undefined;
  }

  constructor(props: EntityProps<MfaSessionId, MfaSessionProps>) {
    super({ ...props });
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

  toObject() {
    return {
      verifiedAt: this.props.verifiedAt?.toISOString() ?? null,
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

  verify(now: Date): void {
    if (this.isVerified) throw MfaAlreadyVerifiedViolation.create();

    this.mutate(current => ({
      ...current,
      challenges: current.challenges.filter(c => !c.isExpired(now)),
      verifiedAt: now,
    }));

    // this.mutate(draft => {
    //   draft.props.challenges = draft.props.challenges.filter(
    //     c => !c.isExpired(now),
    //   );

    // TODO: this section should be tested, after mutation we have to know challenges length was not be 0,
    // validation should consider this situation
    //   if (draft.props.challenges.length === 0) {
    //     throw new Error('No valid MFA challenges to verify');
    //   }

    //   draft.props.verifiedAt = now;
    // });
  }
}
