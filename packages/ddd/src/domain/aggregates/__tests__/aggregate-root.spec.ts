import { describe, expect, it } from 'vitest';

import { EntityValidationError } from '../../errors/entity-validation.error';
import { AggregateRoot } from '../aggregate-root';
import { DomainEvent } from '../../events/domain.event';
import { UUID } from '../../value-objects/id.vo';

// Test implementations
interface OrderProps {
  customerId: string;
  total: number;
}

class OrderCreatedEvent extends DomainEvent<UUID, { customerId: string }> {
  public readonly eventName = 'OrderCreated';

  public static create(props: {
    id?: string;
    aggregateId: UUID;
    schemaVersion: number;
    occurredAt: number;
    payload: { customerId: string };
  }): OrderCreatedEvent {
    return new OrderCreatedEvent(props);
  }
}

class OrderCompletedEvent extends DomainEvent<UUID, { total: number }> {
  public readonly eventName = 'OrderCompleted';

  public static create(props: {
    id?: string;
    aggregateId: UUID;
    schemaVersion: number;
    occurredAt: number;
    payload: { total: number };
  }): OrderCompletedEvent {
    return new OrderCompletedEvent(props);
  }
}

class Order extends AggregateRoot<UUID, OrderProps> {
  constructor(params: { id: UUID; createdAt?: Date; props: OrderProps }) {
    super(params);
  }

  public validate(): void {
    if (!this.props.customerId || this.props.customerId.trim().length === 0) {
      throw EntityValidationError.create('Customer ID is required');
    }
    if (this.props.total < 0) {
      throw EntityValidationError.create('Total must be non-negative');
    }
  }

  public toObject(): Record<string, unknown> {
    return {
      id: this.id.toString(),
      createdAt: this.createdAt.toISOString(),
      customerId: this.props.customerId,
      total: this.props.total,
    };
  }

  public create(): void {
    this.addEvent(
      OrderCreatedEvent.create({
        aggregateId: this.id,
        schemaVersion: 1,
        occurredAt: Date.now(),
        payload: { customerId: this.props.customerId },
      }),
    );
  }

  public complete(): void {
    this.addEvent(
      OrderCompletedEvent.create({
        aggregateId: this.id,
        schemaVersion: 1,
        occurredAt: Date.now(),
        payload: { total: this.props.total },
      }),
    );
  }
}

describe('AggregateRoot', () => {
  describe('addEvent', () => {
    it('should add domain event', () => {
      const order = new Order({
        id: UUID.generate(),
        props: { customerId: 'customer-1', total: 100 },
      });

      order.create();

      expect(order.domainEvents).toHaveLength(1);
      expect(order.domainEvents[0]).toBeInstanceOf(OrderCreatedEvent);
      expect(order.domainEvents[0].eventName).toBe('OrderCreated');
    });

    it('should add multiple domain events', () => {
      const order = new Order({
        id: UUID.generate(),
        props: { customerId: 'customer-1', total: 100 },
      });

      order.create();
      order.complete();

      expect(order.domainEvents).toHaveLength(2);
      expect(order.domainEvents[0]).toBeInstanceOf(OrderCreatedEvent);
      expect(order.domainEvents[1]).toBeInstanceOf(OrderCompletedEvent);
    });

    it('should return copy of events that does not affect original', () => {
      const order = new Order({
        id: UUID.generate(),
        props: { customerId: 'customer-1', total: 100 },
      });

      order.create();
      const events = order.domainEvents;
      const originalLength = events.length;

      // Create a new array with additional event to verify copy behavior
      const modifiedEvents = [...events];
      modifiedEvents.push(
        OrderCreatedEvent.create({
          aggregateId: UUID.generate(),
          schemaVersion: 1,
          occurredAt: Date.now(),
          payload: { customerId: 'customer-2' },
        }),
      );

      // Original should still have the same length
      expect(order.domainEvents).toHaveLength(originalLength);
      expect(modifiedEvents.length).toBeGreaterThan(originalLength);
    });
  });

  describe('pullDomainEvents', () => {
    it('should return and clear domain events', () => {
      const order = new Order({
        id: UUID.generate(),
        props: { customerId: 'customer-1', total: 100 },
      });

      order.create();
      order.complete();

      const events = order.pullDomainEvents();

      expect(events).toHaveLength(2);
      expect(events[0]).toBeInstanceOf(OrderCreatedEvent);
      expect(events[1]).toBeInstanceOf(OrderCompletedEvent);
      expect(order.domainEvents).toHaveLength(0);
    });

    it('should return empty array when no events', () => {
      const order = new Order({
        id: UUID.generate(),
        props: { customerId: 'customer-1', total: 100 },
      });

      const events = order.pullDomainEvents();

      expect(events).toHaveLength(0);
    });

    it('should clear events after pulling', () => {
      const order = new Order({
        id: UUID.generate(),
        props: { customerId: 'customer-1', total: 100 },
      });

      order.create();
      order.pullDomainEvents();
      order.complete();

      const events = order.pullDomainEvents();

      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(OrderCompletedEvent);
    });
  });

  describe('domainEvents getter', () => {
    it('should return copy of events', () => {
      const order = new Order({
        id: UUID.generate(),
        props: { customerId: 'customer-1', total: 100 },
      });

      order.create();
      const events1 = order.domainEvents;
      const events2 = order.domainEvents;

      expect(events1).not.toBe(events2);
      expect(events1).toEqual(events2);
    });
  });

  describe('inheritance from Entity', () => {
    it('should inherit entity properties', () => {
      const id = UUID.generate();
      const order = new Order({
        id,
        props: { customerId: 'customer-1', total: 100 },
      });

      expect(order.id).toBe(id);
      expect(order.createdAt).toBeInstanceOf(Date);
    });

    it('should inherit entity methods', () => {
      const id = UUID.generate();
      const order1 = new Order({
        id,
        props: { customerId: 'customer-1', total: 100 },
      });
      const order2 = new Order({
        id,
        props: { customerId: 'customer-2', total: 200 },
      });

      expect(order1.equals(order2)).toBe(true);
    });
  });
});
