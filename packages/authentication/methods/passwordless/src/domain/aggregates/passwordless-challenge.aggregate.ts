import { AggregateRoot, EntityProps } from '@rineex/ddd';

import { createHash, timingSafeEqual } from 'node:crypto';

import {
  PasswordlessChallengeAlreadyUsedError,
  PasswordlessChallengeChannelRequired,
  PasswordlessChallengeExpiredError,
  PasswordlessChallengeInvalidExpiration,
  PasswordlessChallengeSecretMismatchError,
  PasswordlessChallengeSecretRequired,
} from '../errors/passwordless-challenge.error';
import { PasswordlessChallengeVerifiedEvent } from '../events/passwordless-challenge-verified.event';
import { PasswordlessChallengeIssuedEvent } from '../events/passwordless-challenge-issued.event';
import { PasswordlessChallengeStatus } from '../value-objects/passwordless-challenge-status.vo';
import { PasswordlessChallengeId } from '../value-objects/passwordless-challenge-id.vo';
import { ChallengeDestination } from '../value-objects/challenge-destination.vo';
import { ChallengeSecret } from '../value-objects/challenge-secret.vo';
import { PasswordlessChannel } from '../value-objects/channel.vo';

/**
 * Properties for a passwordless challenge aggregate.
 *
 * @property {PasswordlessChannel} channel - The channel used for passwordless authentication
 * @property {ChallengeDestination} destination - The destination where the challenge is sent
 * @property {ChallengeSecret} secret - The secret generated for the challenge
 * @property {Date} issuedAt - Timestamp when the challenge was issued
 * @property {Date} expiresAt - Timestamp when the challenge expires
 * @property {PasswordlessChallengeStatus} status - Current status of the challenge
 */
type PasswordlessChallengeProps = {
  readonly channel: PasswordlessChannel;
  readonly destination: ChallengeDestination;
  readonly secret: ChallengeSecret;
  readonly issuedAt: Date;
  readonly expiresAt: Date;
  status: PasswordlessChallengeStatus;
};

/**
 * Properties required to create a new passwordless challenge aggregate.
 */
type CreatePasswordlessProps = EntityProps<
  PasswordlessChallengeId,
  PasswordlessChallengeProps
>;

/**
 * Aggregate root representing a passwordless authentication challenge.
 *
 * This aggregate manages the lifecycle of a passwordless challenge, including:
 * - Creation and issuance
 * - Secret verification
 * - Expiration checking
 * - Status management
 *
 * @example
 * ```typescript
 * const challenge = PasswordlessChallengeAggregate.issue({
 *   id: challengeId,
 *   createdAt: new Date(),
 *   props: {
 *     channel: PasswordlessChannel.create('email'),
 *     destination: ChallengeDestination.create('user@example.com'),
 *     secret: ChallengeSecret.create('123456'),
 *     issuedAt: new Date(),
 *     expiresAt: new Date(Date.now() + 600000),
 *     status: PasswordlessChallengeStatus.issued(),
 *   },
 * });
 * ```
 */
export class PasswordlessChallengeAggregate extends AggregateRoot<
  PasswordlessChallengeId,
  PasswordlessChallengeProps
> {
  /**
   * Creates and issues a new passwordless challenge.
   *
   * This factory method creates a new challenge aggregate and emits a
   * PasswordlessChallengeIssuedEvent domain event.
   *
   * @param {CreatePasswordlessProps} props - Properties for creating the challenge
   * @param {PasswordlessChallengeId} props.id - Unique identifier for the challenge
   * @param {Date} [props.createdAt] - Creation timestamp (defaults to current time)
   * @param {PasswordlessChallengeProps} props.props - Challenge properties
   * @returns {PasswordlessChallengeAggregate} A new passwordless challenge aggregate
   */
  public static issue({
    createdAt,
    props,
    id,
  }: CreatePasswordlessProps): PasswordlessChallengeAggregate {
    const challenge = new PasswordlessChallengeAggregate({
      createdAt,
      props,
      id,
    });

    challenge.addEvent(
      PasswordlessChallengeIssuedEvent.create({
        payload: {
          expiresAt: challenge.props.expiresAt.toISOString(),
          destination: challenge.props.destination.value,
          channel: challenge.props.channel.value,
        },
        occurredAt: props.issuedAt.getTime(),
        aggregateId: challenge.id,
        schemaVersion: 1,
      }),
    );

    return challenge;
  }

  /**
   * Checks if the challenge has expired.
   *
   * @param {Date} [now] - Optional current date for comparison (defaults to new Date())
   * @returns {boolean} True if the challenge has expired, false otherwise
   */
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
   * Converts the aggregate to a plain object representation.
   *
   * @returns {Object} Plain object containing challenge information
   * @returns {string} returns.issuedAt - ISO string of when the challenge was issued
   * @returns {string} returns.destination - The destination value
   * @returns {string} returns.channel - The channel value
   * @returns {boolean} returns.expired - Whether the challenge has expired
   */
  toObject() {
    return {
      issuedAt: this.props.issuedAt.toISOString(),
      destination: this.props.destination.value,
      channel: this.props.channel.value,
      expired: this.isExpired(),
    };
  }

  /**
   * Validates the challenge aggregate's invariants.
   *
   * @throws {PasswordlessChallengeChannelRequired} If channel is missing
   * @throws {PasswordlessChallengeSecretRequired} If secret is missing
   * @throws {PasswordlessChallengeInvalidExpiration} If expiration is invalid
   */
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

  /**
   * Verifies a passwordless challenge with the provided secret.
   *
   * @param {string} secret - The secret to verify against the challenge
   * @param {Date} [now] - Optional current date for expiration checking (defaults to new Date())
   * @throws {PasswordlessChallengeExpiredError} If the challenge has expired
   * @throws {PasswordlessChallengeAlreadyUsedError} If the challenge has already been verified
   * @throws {PasswordlessChallengeSecretMismatchError} If the provided secret does not match
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
      throw PasswordlessChallengeExpiredError.create();
    }

    if (this.props.status.isFinal()) {
      throw PasswordlessChallengeAlreadyUsedError.create();
    }

    if (!this.matchesSecret(secret)) {
      throw PasswordlessChallengeSecretMismatchError.create();
    }

    this.mutate(current => ({
      ...current,
      status: PasswordlessChallengeStatus.verified(),
    }));

    this.addEvent(
      PasswordlessChallengeVerifiedEvent.create({
        payload: {
          destination: this.props.destination.value,
          channel: this.props.channel.value,
          verifiedAt: now.toISOString(),
        },
        occurredAt: now.getTime(),
        aggregateId: this.id,
        schemaVersion: 1,
      }),
    );
  }
}
