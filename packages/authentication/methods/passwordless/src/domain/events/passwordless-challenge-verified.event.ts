import { CreateEventProps, DomainEvent, DomainEventPayload } from '@rineex/ddd';

import { PasswordlessChallengeId } from '..';

/**
 * Payload for the PasswordlessChallengeVerifiedEvent.
 *
 * @property {string} channel - The channel used for passwordless authentication (e.g., 'email', 'sms')
 * @property {string} destination - The destination where the challenge was sent (e.g., email address, phone number)
 * @property {string} verifiedAt - ISO 8601 timestamp indicating when the challenge was verified
 */
export type PasswordlessChallengeVerifiedPayload = DomainEventPayload & {
  channel: string;
  destination: string;
  verifiedAt: string;
};

/**
 * Domain event emitted when a passwordless authentication challenge is verified.
 *
 * This event is raised when a passwordless challenge (e.g., OTP code) is successfully
 * verified by the user through a specific channel (email, SMS, etc.).
 *
 * @example
 * ```typescript
 * const event = PasswordlessChallengeVerifiedEvent.create({
 *   aggregateId: challengeId,
 *   schemaVersion: 1,
 *   occurredAt: Date.now(),
 *   payload: {
 *     channel: 'email',
 *     destination: 'user@example.com',
 *     verifiedAt: new Date().toISOString(),
 *   },
 * });
 * ```
 */
export class PasswordlessChallengeVerifiedEvent extends DomainEvent<
  PasswordlessChallengeId,
  PasswordlessChallengeVerifiedPayload
> {
  /**
   * The unique name identifier for this domain event.
   * Used for event routing, logging, and event store indexing.
   */
  public readonly eventName = 'auth.passwordless.challenge_verified';

  /**
   * Creates a new PasswordlessChallengeVerifiedEvent instance.
   *
   * @param {CreateEventProps<PasswordlessChallengeVerifiedPayload, PasswordlessChallengeId>} props - The event creation properties
   * @param {PasswordlessChallengeId} props.aggregateId - The ID of the passwordless challenge aggregate
   * @param {number} props.schemaVersion - The schema version of the event payload
   * @param {number} props.occurredAt - Unix timestamp in milliseconds when the event occurred
   * @param {PasswordlessChallengeVerifiedPayload} props.payload - The event payload containing verification details
   * @param {string} [props.id] - Optional custom event ID (auto-generated if not provided)
   * @returns {PasswordlessChallengeVerifiedEvent} A new instance of PasswordlessChallengeVerifiedEvent
   */
  public static create(
    props: CreateEventProps<
      PasswordlessChallengeVerifiedPayload,
      PasswordlessChallengeId
    >,
  ): PasswordlessChallengeVerifiedEvent {
    return new PasswordlessChallengeVerifiedEvent(props);
  }
}
