import { AuthDomainViolation } from '@/domain/violations/auth-domain.violation';
import { DomainErrorType, Entity, EntityProps } from '@rineex/ddd';
import { IdentityId } from '@/index';

import { MfaChallengeId } from '../value-objects/mfa-challenge-id.vo';
import { MfaChallengeType } from '../types/mfa-challenge-registry';

export interface Props {
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
  readonly type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  static create() {
    return new MfaChallengeExpiredViolation();
  }
}

export class MFAChallenge extends Entity<MfaChallengeId, Props> {
  get challengeType() {
    return this.props.challengeType;
  }

  public static create(
    props: EntityProps<MfaChallengeId, Props>,
  ): MFAChallenge {
    return new MFAChallenge(props);
  }

  /**
   * Checks whether the challenge is expired.
   */
  isExpired(now: Date): boolean {
    return now > this.props.expiresAt;
  }

  toObject() {
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
      throw MfaChallengeExpiredViolation.create();
    }
  }
}
