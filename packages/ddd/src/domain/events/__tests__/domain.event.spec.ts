import { describe, expect, it } from 'vitest';

import { DomainEvent, DomainEventPayload } from '../domain.event';
import { UUID } from '../../value-objects/id.vo';

// Test implementations
interface TestPayload extends DomainEventPayload {
  userId: string;
  action: string;
}

class TestDomainEvent extends DomainEvent<UUID, TestPayload> {
  public readonly eventName = 'TestEvent';

  // Expose protected constructor for testing
  public static create(props: {
    id?: string;
    aggregateId: UUID;
    schemaVersion: number;
    occurredAt: number;
    payload: TestPayload;
  }): TestDomainEvent {
    return new TestDomainEvent(props);
  }
}

describe('DomainEvent', () => {
  describe('constructor', () => {
    it('should create a domain event with all properties', () => {
      const aggregateId = UUID.generate();
      const occurredAt = Date.now();
      const payload: TestPayload = { userId: 'user-1', action: 'login' };

      const event = TestDomainEvent.create({
        aggregateId,
        schemaVersion: 1,
        occurredAt,
        payload,
      });

      expect(event.aggregateId).toBe(aggregateId);
      expect(event.eventName).toBe('TestEvent');
      expect(event.schemaVersion).toBe(1);
      expect(event.occurredAt).toBe(occurredAt);
      expect(event.payload).toEqual(payload);
      expect(event.id).toBeDefined();
    });

    it('should generate UUID if id not provided', () => {
      const aggregateId = UUID.generate();
      const event1 = TestDomainEvent.create({
        aggregateId,
        schemaVersion: 1,
        occurredAt: Date.now(),
        payload: { userId: 'user-1', action: 'login' },
      });
      const event2 = TestDomainEvent.create({
        aggregateId,
        schemaVersion: 1,
        occurredAt: Date.now(),
        payload: { userId: 'user-1', action: 'login' },
      });

      expect(event1.id).toBeDefined();
      expect(event2.id).toBeDefined();
      expect(event1.id).not.toBe(event2.id);
    });

    it('should use provided id', () => {
      const aggregateId = UUID.generate();
      const customId = 'custom-event-id';

      const event = TestDomainEvent.create({
        id: customId,
        aggregateId,
        schemaVersion: 1,
        occurredAt: Date.now(),
        payload: { userId: 'user-1', action: 'login' },
      });

      expect(event.id).toBe(customId);
    });

    it('should freeze payload', () => {
      const aggregateId = UUID.generate();
      const payload: TestPayload = { userId: 'user-1', action: 'login' };

      const event = TestDomainEvent.create({
        aggregateId,
        schemaVersion: 1,
        occurredAt: Date.now(),
        payload,
      });

      expect(() => {
        (event.payload as any).userId = 'user-2';
      }).toThrow();
    });
  });

  describe('toPrimitives', () => {
    it('should convert event to primitives', () => {
      const aggregateId = UUID.generate();
      const occurredAt = Date.now();
      const payload: TestPayload = { userId: 'user-1', action: 'login' };

      const event = TestDomainEvent.create({
        aggregateId,
        schemaVersion: 1,
        occurredAt,
        payload,
      });

      const primitives = event.toPrimitives();

      expect(primitives).toEqual({
        id: event.id,
        eventName: 'TestEvent',
        aggregateId: aggregateId.toString(),
        schemaVersion: 1,
        occurredAt,
        payload,
      });
    });

    it('should return primitives with correct structure', () => {
      const aggregateId = UUID.generate();
      const event = TestDomainEvent.create({
        aggregateId,
        schemaVersion: 1,
        occurredAt: Date.now(),
        payload: { userId: 'user-1', action: 'login' },
      });

      const primitives = event.toPrimitives();

      expect(primitives).toHaveProperty('id');
      expect(primitives).toHaveProperty('eventName');
      expect(primitives).toHaveProperty('aggregateId');
      expect(primitives).toHaveProperty('schemaVersion');
      expect(primitives).toHaveProperty('occurredAt');
      expect(primitives).toHaveProperty('payload');
    });
  });

  describe('eventName', () => {
    it('should have correct event name', () => {
      const aggregateId = UUID.generate();
      const event = TestDomainEvent.create({
        aggregateId,
        schemaVersion: 1,
        occurredAt: Date.now(),
        payload: { userId: 'user-1', action: 'login' },
      });

      expect(event.eventName).toBe('TestEvent');
    });
  });

  describe('payload', () => {
    it('should store payload correctly', () => {
      const aggregateId = UUID.generate();
      const payload: TestPayload = { userId: 'user-1', action: 'login' };

      const event = TestDomainEvent.create({
        aggregateId,
        schemaVersion: 1,
        occurredAt: Date.now(),
        payload,
      });

      expect(event.payload).toEqual(payload);
      expect(event.payload.userId).toBe('user-1');
      expect(event.payload.action).toBe('login');
    });
  });
});
