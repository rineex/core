import { AuthDomainViolation } from '@/domain/violations/auth-domain.violation';
import { CreateEntityProps, Entity } from '@rineex/ddd';
import { IdentityId } from '@/index';

import { MfaChallengeId } from '../value-objects/mfa-challenge-id.vo';
import { MfaChallengeType } from '../types/mfa-challenge-registry';

export interface Props extends CreateEntityProps<MfaChallengeId> {
  /**
   * Authentication identity this challenge is bound to.
   * This is NOT an application user.
   */
  readonly identityId: IdentityId;

  readonly challengeType: MfaChallengeType;

  /**
   * Challenge issue time.
   */
  readonly issuedAt: Date;

  /**
   * Absolute expiration timestamp.
   */
  readonly expiresAt: Date;
}

class MfaChallengeExpiredViolation extends AuthDomainViolation {
  readonly code = 'MFA_CHALLENGE_EXPIRED';
  readonly message = 'MFA challenge has expired';

  static create(reason: string) {
    return new MfaChallengeExpiredViolation({ reason });
  }
}

export class MFAChallenge extends Entity<MfaChallengeId> {
  constructor(public readonly props: Props) {
    super(props);
  }

  toObject(): Record<string, unknown> {
    return {
      identityId: this.props.identityId.toString(),
      challengeType: this.props.challengeType,
      expiresAt: this.props.expiresAt,
      issuedAt: this.props.issuedAt,
      id: this.id.toString(),
    };
  }

  validate(): void {
    if (this.props.expiresAt <= this.props.issuedAt) {
      throw MfaChallengeExpiredViolation.create(
        'MFA challenge expiration must be after issue time',
      );
    }
  }

  public static create(props: Props): MFAChallenge {
    return new MFAChallenge(props);
  }

  /**
   * Checks whether the challenge is expired.
   */
  isExpired(now: Date): boolean {
    return now > this.props.expiresAt;
  }
}
