import type { DecisionEvent } from '@/domain/model/decision-event';

/**
 * Handles a decision event delivered by an in-process publisher.
 *
 * @typeParam Event - Concrete decision event type handled by the subscriber.
 */
export interface DecisionEventHandler<
  Event extends DecisionEvent = DecisionEvent,
> {
  /**
   * Handles one immutable decision event.
   *
   * @param event - Event delivered by the publisher.
   * @returns Completion after the subscriber has finished processing.
   *
   * @throws When the subscriber cannot process the event successfully.
   */
  handle: (event: Event) => Promise<void>;
}
