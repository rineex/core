import { DomainEvent } from '@rineex/ddd';

/**
 * Publishes domain events emitted by aggregates.
 *
 * Implementations may:
 * - dispatch to message bus
 * - log events
 * - forward to observability stack
 */
export type DomainEventPublisherPort = {
  publish: (events: readonly DomainEvent[]) => Promise<void>;
};
