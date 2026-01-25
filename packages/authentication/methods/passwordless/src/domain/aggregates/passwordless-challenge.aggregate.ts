import { AggregateRoot, EntityProps } from '@rineex/ddd';
import { ChallengeDestination } from '../value-objects/challenge-destination.vo';
import { ChallengeSecret } from '../value-objects/challenge-secret.vo';
import { PasswordlessChallengeId } from '../value-objects/passwordless-challenge-id.vo';
import { PasswordlessChallengeIssuedEvent } from '../events/passwordless-challenge-issued.event';
import { PasswordlessChallengeVerifiedEvent } from '../events/passwordless-challenge-verified.event';
import { PasswordlessChannel } from '../value-objects/channel.vo';
import { PasswordlessChallengeStatus } from '../value-objects/passwordless-challenge-status.vo';
import { createHash, timingSafeEqual } from 'node:crypto';
import {
  PasswordlessChallengeChannelRequired,
  PasswordlessChallengeExpired,
  PasswordlessChallengeInvalidExpiration,
  PasswordlessChallengeAlreadyUsedErr,
  PasswordlessChallengeSecretMismatch,
  PasswordlessChallengeSecretRequired,
} from '../errors/passwordless-challenge.error';

type PasswordlessChallengeProps = {
  readonly channel: PasswordlessChannel;
  readonly destination: ChallengeDestination;
  readonly secret: ChallengeSecret;
  readonly issuedAt: Date;
  readonly expiresAt: Date;
  status: PasswordlessChallengeStatus;
};

type CreatePasswordlessProps = EntityProps<
  PasswordlessChallengeId,
  PasswordlessChallengeProps
>;

export class PasswordlessChallengeAggregate extends AggregateRoot<
  PasswordlessChallengeId,
  PasswordlessChallengeProps
> {
  validate(): void {
    if (!this.props.channel) {
      throw PasswordlessChallengeChannelRequired.create();
    }
    if (!this.props.secret) {
      throw PasswordlessChallengeSecretRequired.create();
    }

    if (this.props.expiresAt <= this.props.issuedAt) {
      throw PasswordlessChallengeInvalidExpiration.create();
    }
  }

  public static issue({
    props,
    id,
    createdAt,
  }: CreatePasswordlessProps): PasswordlessChallengeAggregate {
    const challenge = new PasswordlessChallengeAggregate({
      props,
      id,
      createdAt,
    });

    challenge.addEvent(
      PasswordlessChallengeIssuedEvent.create({
        aggregateId: challenge.id,
        occurredAt: props.issuedAt.getTime(),
        schemaVersion: 1,
        payload: {
          channel: challenge.props.channel.value,
          destination: challenge.props.destination.value,
          expiresAt: challenge.props.expiresAt.toISOString(),
        },
      }),
    );

    return challenge;
  }

  isExpired(now = new Date()): boolean {
    return now > this.props.expiresAt;
  }

  /**
   * Checks if the provided input matches the challenge secret.
   *
   * Uses constant-time comparison via Node.js crypto.timingSafeEqual to prevent
   * timing attacks that could leak information about the secret's length or
   * which characters differ.
   *
   * @param {string} input - The secret input to verify
   * @returns {boolean} True if the input matches the secret, false otherwise
   *
   * @remarks
   * This method uses timingSafeEqual which performs a constant-time comparison
   * to prevent timing attacks. Both strings are converted to Buffers for comparison.
   * Length comparison is done first (length is typically public knowledge for OTPs),
   * then timingSafeEqual ensures character-by-character comparison is constant-time.
   */
  matchesSecret(input: string): boolean {
    const secretValue = this.props.secret.value;

    const secretHash = createHash('sha256')
      .update(secretValue, 'utf8')
      .digest();

    const inputHash = createHash('sha256').update(input, 'utf8').digest();

    return timingSafeEqual(secretHash, inputHash);
  }

  /**
   * Verifies a passwordless challenge with the provided secret.
   *
   * @param {string} secret - The secret to verify against the challenge
   * @param {Date} [now] - Optional current date for expiration checking (defaults to new Date())
   * @throws {PasswordlessChallengeExpired} If the challenge has expired
   * @throws {PasswordlessChallengeAlreadyUsedErr} If the challenge has already been verified
   * @throws {PasswordlessChallengeSecretMismatch} If the provided secret does not match
   *
   * @example
   * ```typescript
   * try {
   *   challenge.verify('123456', new Date());
   *   // Challenge verified successfully
   * } catch (error) {
   *   // Handle verification failure
   * }
   * ```
   */
  verify(secret: string, now = new Date()): void {
    if (this.isExpired(now)) {
      throw PasswordlessChallengeExpired.create();
    }

    if (this.props.status.isFinal()) {
      throw PasswordlessChallengeAlreadyUsedErr.create();
    }

    if (!this.matchesSecret(secret)) {
      throw PasswordlessChallengeSecretMismatch.create();
    }

    this.mutate(current => ({
      ...current,
      status: PasswordlessChallengeStatus.verified(),
    }));

    this.addEvent(
      PasswordlessChallengeVerifiedEvent.create({
        aggregateId: this.id,
        occurredAt: now.getTime(),
        schemaVersion: 1,
        payload: {
          channel: this.props.channel.value,
          destination: this.props.destination.value,
          verifiedAt: now.toISOString(),
        },
      }),
    );
  }

  toObject() {
    return {
      channel: this.props.channel.value,
      destination: this.props.destination.value,
      issuedAt: this.props.issuedAt.toISOString(),
      expired: this.isExpired(),
    };
  }
}
