import { CreateEventProps, DomainEvent, DomainEventPayload } from '@rineex/ddd';

import { PasswordlessChallengeId } from '../value-objects/passwordless-challenge-id.vo';

/**
 * Payload for the PasswordlessChallengeIssuedEvent.
 *
 * @property {string} channel - The channel used for passwordless authentication (e.g., 'email', 'sms')
 * @property {string} destination - The destination where the challenge is sent (e.g., email address, phone number)
 * @property {string} expiresAt - ISO 8601 timestamp indicating when the challenge expires
 */
export type PasswordlessChallengeIssuedPayload = DomainEventPayload & {
  channel: string;
  destination: string;
  expiresAt: string;
};

/**
 * Domain event emitted when a passwordless authentication challenge is issued.
 *
 * This event is raised when a new passwordless challenge (e.g., OTP code) is created
 * and sent to the user through a specific channel (email, SMS, etc.).
 *
 * @example
 * ```typescript
 * const event = PasswordlessChallengeIssuedEvent.create({
 *   aggregateId: challengeId,
 *   schemaVersion: 1,
 *   occurredAt: Date.now(),
 *   payload: {
 *     channel: 'email',
 *     destination: 'user@example.com',
 *     expiresAt: new Date(Date.now() + 600000).toISOString(),
 *   },
 * });
 * ```
 */
export class PasswordlessChallengeIssuedEvent extends DomainEvent<
  PasswordlessChallengeId,
  PasswordlessChallengeIssuedPayload
> {
  /**
   * The unique name identifier for this domain event.
   * Used for event routing, logging, and event store indexing.
   */
  public readonly eventName = 'auth.passwordless.challenge_created';

  /**
   * Creates a new PasswordlessChallengeIssuedEvent instance.
   *
   * @param {CreateEventProps<PasswordlessChallengeIssuedPayload, PasswordlessChallengeId>} props - The event creation properties
   * @param {PasswordlessChallengeId} props.aggregateId - The ID of the passwordless challenge aggregate
   * @param {number} props.schemaVersion - The schema version of the event payload
   * @param {number} props.occurredAt - Unix timestamp in milliseconds when the event occurred
   * @param {PasswordlessChallengeIssuedPayload} props.payload - The event payload containing challenge details
   * @param {string} [props.id] - Optional custom event ID (auto-generated if not provided)
   * @returns {PasswordlessChallengeIssuedEvent} A new instance of PasswordlessChallengeIssuedEvent
   */
  public static create(
    props: CreateEventProps<
      PasswordlessChallengeIssuedPayload,
      PasswordlessChallengeId
    >,
  ): PasswordlessChallengeIssuedEvent {
    return new PasswordlessChallengeIssuedEvent(props);
  }
}
