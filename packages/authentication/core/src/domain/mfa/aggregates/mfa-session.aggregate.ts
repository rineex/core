import { AggregateRoot, EntityProps } from '@rineex/ddd';

import { IdentityId } from '@/index';

import { MfaActiveChallengeExistsError } from '../errors/mfa-active-challenge-exists.error';
import { MfaAttemptsExceededError } from '../errors/mfa-attempts-exceeded.error';
import { MfaAlreadyVerifiedError } from '../errors/mfa-already-verified.error';
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
    if (this.isVerified) throw MfaAlreadyVerifiedError.create();

    const hasActive = this.props.challenges.some(c => !c.isExpired(now));

    if (hasActive) {
      throw MfaActiveChallengeExistsError.create();
    }

    this.mutate(current => ({
      ...current,
      challenges: [...current.challenges, challenge],
    }));
  }

  markAttempt(): void {
    this.mutate(current => ({
      ...current,
      attemptsUsed: current.attemptsUsed + 1,
    }));

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
      throw MfaAttemptsExceededError.create(
        this.props.attemptsUsed,
        this.props.maxAttempts,
      );
    }

    if (this.props.verifiedAt && this.props.challenges.length > 0) {
      throw new Error('Verified MFA session cannot have active challenges');
    }
  }

  verify(now: Date): void {
    if (this.isVerified) throw MfaAlreadyVerifiedError.create();

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
