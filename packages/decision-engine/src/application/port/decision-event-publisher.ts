import type { DecisionEvent } from '@/domain/model/decision-event';

/**
 * Publishes decision events produced by the decision engine.
 *
 * Implementations may deliver events in-process or through external
 * infrastructure such as a message broker or transactional outbox.
 */
export interface DecisionEventPublisher {
  /**
   * Publishes events in the order supplied by the caller.
   *
   * @param events - Immutable decision events to publish.
   * @returns Completion when all events have been processed according
   * to the publisher's delivery semantics.
   *
   * @throws When event delivery fails and the implementation cannot
   * satisfy its configured delivery guarantees.
   */
  publish: (events: readonly DecisionEvent[]) => Promise<void>;
}
