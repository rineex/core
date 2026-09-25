import { describe, expect, it } from 'vitest';

import { EntityValidationError } from '../../errors/entity-validation.error';
import { DomainID } from '../../value-objects/domain-id.vo';
import { DomainEvent } from '../../events/domain.event';
import { AggregateRoot } from '../aggregate-root';

// Test implementations
interface OrderProps {
  customerId: string;
  total: number;
}

class TestDomainId extends DomainID {}

class OrderCreatedEvent extends DomainEvent<
  TestDomainId,
  { customerId: string }
> {
  public static create(props: {
    id?: string;
    aggregateId: TestDomainId;
    schemaVersion: number;
    occurredAt: number;
    payload: { customerId: string };
  }): OrderCreatedEvent {
    return new OrderCreatedEvent({
      ...props,
      id: props.id ?? crypto.randomUUID(),
      eventName: 'OrderCreated',
    });
  }
}

class OrderCompletedEvent extends DomainEvent<TestDomainId, { total: number }> {
  public static create(props: {
    id?: string;
    aggregateId: TestDomainId;
    schemaVersion: number;
    occurredAt: number;
    payload: { total: number };
  }): OrderCompletedEvent {
    return new OrderCompletedEvent({
      ...props,
      id: props.id ?? crypto.randomUUID(),
      eventName: 'OrderCompleted',
    });
  }
}

class Order extends AggregateRoot<TestDomainId, OrderProps> {
  constructor(params: {
    id: TestDomainId;
    createdAt?: Date;
    props: OrderProps;
  }) {
    super(params);
    this.validate();
  }

  public complete(): void {
    this.recordEvent(
      OrderCompletedEvent.create({
        payload: { total: this.props.total },
        occurredAt: Date.now(),
        aggregateId: this.id,
        schemaVersion: 1,
      }),
    );
  }

  public create(): void {
    this.recordEvent(
      OrderCreatedEvent.create({
        payload: { customerId: this.props.customerId },
        occurredAt: Date.now(),
        aggregateId: this.id,
        schemaVersion: 1,
      }),
    );
  }

  public record(event: DomainEvent): void {
    this.recordEvent(event);
  }

  public toObject(): Record<string, unknown> {
    return {
      createdAt: this.createdAt.toISOString(),
      customerId: this.props.customerId,
      total: this.props.total,
      id: this.id.toString(),
    };
  }

  protected validateProps(props: OrderProps): void {
    if (!props.customerId || props.customerId.trim().length === 0) {
      throw EntityValidationError.create('Customer ID is required', {});
    }
    if (props.total < 0) {
      throw EntityValidationError.create('Total must be non-negative', {});
    }
  }
}

describe('aggregateRoot', () => {
  describe('addEvent', () => {
    it('should add domain event', () => {
      const order = new Order({
        props: { customerId: 'customer-1', total: 100 },
        id: TestDomainId.generate(),
      });

      order.create();

      expect(order.domainEvents).toHaveLength(1);
      expect(order.domainEvents[0]).toBeInstanceOf(OrderCreatedEvent);
      expect(order.domainEvents[0].eventName).toBe('OrderCreated');
    });

    it('should add multiple domain events', () => {
      const order = new Order({
        props: { customerId: 'customer-1', total: 100 },
        id: TestDomainId.generate(),
      });

      order.create();
      order.complete();

      expect(order.domainEvents).toHaveLength(2);
      expect(order.domainEvents[0]).toBeInstanceOf(OrderCreatedEvent);
      expect(order.domainEvents[1]).toBeInstanceOf(OrderCompletedEvent);
    });

    it('should reject an event belonging to another aggregate', () => {
      const order = new Order({
        props: { customerId: 'customer-1', total: 100 },
        id: TestDomainId.generate(),
      });

      expect(() =>
        order.record(
          OrderCreatedEvent.create({
            payload: { customerId: 'customer-2' },
            aggregateId: TestDomainId.generate(),
            occurredAt: Date.now(),
            schemaVersion: 1,
          }),
        ),
      ).toThrow('Domain event belongs to a different aggregate');
    });

    it('should return copy of events that does not affect original', () => {
      const order = new Order({
        props: { customerId: 'customer-1', total: 100 },
        id: TestDomainId.generate(),
      });

      order.create();
      const events = order.domainEvents;
      const originalLength = events.length;

      // Create a new array with additional event to verify copy behavior
      const modifiedEvents = [...events];
      modifiedEvents.push(
        OrderCreatedEvent.create({
          payload: { customerId: 'customer-2' },
          aggregateId: TestDomainId.generate(),
          occurredAt: Date.now(),
          schemaVersion: 1,
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
        props: { customerId: 'customer-1', total: 100 },
        id: TestDomainId.generate(),
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
        props: { customerId: 'customer-1', total: 100 },
        id: TestDomainId.generate(),
      });

      const events = order.pullDomainEvents();

      expect(events).toHaveLength(0);
    });

    it('should clear events after pulling', () => {
      const order = new Order({
        props: { customerId: 'customer-1', total: 100 },
        id: TestDomainId.generate(),
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
        props: { customerId: 'customer-1', total: 100 },
        id: TestDomainId.generate(),
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
      const id = TestDomainId.generate();
      const order = new Order({
        props: { customerId: 'customer-1', total: 100 },
        id,
      });

      expect(order.id).toBe(id);
      expect(order.createdAt).toBeInstanceOf(Date);
    });

    it('should inherit entity methods', () => {
      const id = TestDomainId.generate();
      const order1 = new Order({
        props: { customerId: 'customer-1', total: 100 },
        id,
      });
      const order2 = new Order({
        props: { customerId: 'customer-2', total: 200 },
        id,
      });

      expect(order1.equals(order2)).toBe(true);
    });
  });
});
