import { Entity, EntityProps } from '@rineex/ddd';

import { IdentityId } from '@/index';

import { MfaChallengeExpiredError } from '../errors/mfa-challenge-expired.error';
import { MfaChallengeId } from '../value-objects/mfa-challenge-id.vo';
import { MfaChallengeType } from '../types/mfa-challenge-registry';

/**
 * Properties for an MFA challenge entity.
 */
export interface Props {
  /**
   * Authentication identity this challenge is bound to.
   * This is NOT an application user.
   */
  readonly identityId: IdentityId;

  /**
   * Type of MFA challenge (e.g., TOTP, SMS, Email).
   */
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

/**
 * Represents a Multi-Factor Authentication (MFA) challenge entity.
 *
 * @remarks
 * An MFA challenge is issued to verify a user's identity through a second factor.
 * Challenges have a limited validity window and are bound to a specific identity.
 *
 * @example
 * ```typescript
 * const challenge = MFAChallenge.create({
 *   id: MfaChallengeId.generate(),
 *   props: {
 *     identityId: IdentityId.fromString('identity_123'),
 *     challengeType: 'TOTP',
 *     issuedAt: new Date(),
 *     expiresAt: new Date(Date.now() + 300000) // 5 minutes
 *   }
 * });
 *
 * // Check if expired
 * if (challenge.isExpired(new Date())) {
 *   // Handle expired challenge
 * }
 * ```
 */
export class MFAChallenge extends Entity<MfaChallengeId, Props> {
  /**
   * Gets the challenge type.
   *
   * @returns The type of MFA challenge
   */
  get challengeType(): MfaChallengeType {
    return this.props.challengeType;
  }

  /**
   * Creates a new MFA challenge instance.
   *
   * @param props - Entity properties including ID and domain props
   * @returns New MFAChallenge instance
   */
  public static create(
    props: EntityProps<MfaChallengeId, Props>,
  ): MFAChallenge {
    return new MFAChallenge(props);
  }

  /**
   * Checks whether the challenge is expired at the given time.
   *
   * @param now - Current timestamp to check against
   * @returns True if the challenge has expired, false otherwise
   */
  isExpired(now: Date): boolean {
    return now > this.props.expiresAt;
  }

  /**
   * Converts the challenge to a plain object representation.
   *
   * @returns Plain object with challenge properties
   */
  toObject() {
    return {
      identityId: this.props.identityId.toString(),
      challengeType: this.props.challengeType,
      expiresAt: this.props.expiresAt,
      issuedAt: this.props.issuedAt,
      id: this.id.toString(),
    };
  }

  /**
   * Validates the challenge entity invariants.
   *
   * @throws {MfaChallengeExpiredError} If expiration time is before or equal to issue time
   */
  validate(): void {
    if (this.props.expiresAt <= this.props.issuedAt) {
      throw MfaChallengeExpiredError.create();
    }
  }
}
