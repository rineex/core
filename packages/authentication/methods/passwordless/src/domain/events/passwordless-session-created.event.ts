import {
  AggregateId,
  CreateEventProps,
  DomainEvent,
  DomainEventPayload,
} from '@rineex/ddd';

/**
 * Payload for the PasswordlessSessionCreatedEvent.
 *
 * @property {string} email - The email address associated with the passwordless session
 * @property {string} issuedAt - ISO 8601 timestamp indicating when the session was issued
 * @property {string} expiresAt - ISO 8601 timestamp indicating when the session expires
 */
export type PasswordlessSessionCreatedPayload = DomainEventPayload & {
  email: string;
  issuedAt: string;
  expiresAt: string;
};

/**
 * Domain event emitted when a passwordless authentication session is created.
 *
 * This event is raised when a new passwordless session is established after
 * successful challenge verification. The session represents an authenticated
 * state for the user.
 *
 * @example
 * ```typescript
 * const event = PasswordlessSessionCreatedEvent.create({
 *   aggregateId: sessionId,
 *   schemaVersion: 1,
 *   occurredAt: Date.now(),
 *   payload: {
 *     email: 'user@example.com',
 *     issuedAt: new Date().toISOString(),
 *     expiresAt: new Date(Date.now() + 3600000).toISOString(),
 *   },
 * });
 * ```
 */
export class PasswordlessSessionCreatedEvent extends DomainEvent<
  AggregateId,
  PasswordlessSessionCreatedPayload
> {
  /**
   * The unique name identifier for this domain event.
   * Used for event routing, logging, and event store indexing.
   */
  public readonly eventName = 'auth.passwordless.session_created';

  /**
   * Creates a new PasswordlessSessionCreatedEvent instance.
   *
   * @param {CreateEventProps<PasswordlessSessionCreatedPayload, AggregateId>} props - The event creation properties
   * @param {AggregateId} props.aggregateId - The ID of the passwordless session aggregate
   * @param {number} props.schemaVersion - The schema version of the event payload
   * @param {number} props.occurredAt - Unix timestamp in milliseconds when the event occurred
   * @param {PasswordlessSessionCreatedPayload} props.payload - The event payload containing session details
   * @param {string} [props.id] - Optional custom event ID (auto-generated if not provided)
   * @returns {PasswordlessSessionCreatedEvent} A new instance of PasswordlessSessionCreatedEvent
   */
  public static create(
    props: CreateEventProps<PasswordlessSessionCreatedPayload, AggregateId>,
  ): PasswordlessSessionCreatedEvent {
    return new PasswordlessSessionCreatedEvent(props);
  }
}
