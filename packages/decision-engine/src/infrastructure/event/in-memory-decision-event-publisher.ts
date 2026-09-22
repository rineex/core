import type { DecisionEventPublisher } from '@/application/port/decision-event-publisher';
import type { DecisionEvent } from '@/domain/model/decision-event';

import type { DecisionEventHandler } from './decision-event-handler';

/**
 * Publishes decision events to subscribers registered within the current process.
 *
 * This implementation is suitable when durable delivery is not required.
 *
 * Events and handlers are processed deterministically in registration order.
 */
export abstract class InMemoryDecisionEventPublisher implements DecisionEventPublisher {
  /**
   * Registered handlers grouped by event type.
   */
  private readonly handlers: Map<string, readonly DecisionEventHandler[]>;

  /**
   * Creates an empty in-memory event publisher.
   */
  public constructor();

  /**
   * Publishes events sequentially in the supplied order.
   *
   * For each event, matching handlers are invoked sequentially
   * in registration order.
   *
   * @param events - Decision events to publish.
   *
   * @throws When any registered handler fails.
   */
  public async publish(events: readonly DecisionEvent[]): Promise<void>;

  /**
   * Registers a handler for a specific decision event type.
   *
   * Handlers are invoked in registration order.
   *
   * @param eventType - Stable event type to subscribe to.
   * @param handler - Handler that should receive matching events.
   *
   * @throws When the event type is empty.
   */
  public subscribe<Event extends DecisionEvent>(
    eventType: Event['type'],
    handler: DecisionEventHandler<Event>,
  ): void;
}
