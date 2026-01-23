import { describe, expect, it } from 'vitest';

import { DomainEvent, DomainEventPayload } from '../domain.event';
import { UUID } from '../../value-objects/id.vo';

// Test implementations
interface TestPayload extends DomainEventPayload {
  userId: string;
  action: string;
}

/* eslint-disable @typescript-eslint/class-literal-property-style */
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

describe('domainEvent', () => {
  describe('constructor', () => {
    it('should create a domain event with all properties', () => {
      const aggregateId = UUID.generate();
      const occurredAt = Date.now();
      const payload: TestPayload = { userId: 'user-1', action: 'login' };

      const event = TestDomainEvent.create({
        schemaVersion: 1,
        aggregateId,
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
        payload: { userId: 'user-1', action: 'login' },
        occurredAt: Date.now(),
        schemaVersion: 1,
        aggregateId,
      });
      const event2 = TestDomainEvent.create({
        payload: { userId: 'user-1', action: 'login' },
        occurredAt: Date.now(),
        schemaVersion: 1,
        aggregateId,
      });

      expect(event1.id).toBeDefined();
      expect(event2.id).toBeDefined();
      expect(event1.id).not.toBe(event2.id);
    });

    it('should use provided id', () => {
      const aggregateId = UUID.generate();
      const customId = 'custom-event-id';

      const event = TestDomainEvent.create({
        payload: { userId: 'user-1', action: 'login' },
        occurredAt: Date.now(),
        schemaVersion: 1,
        id: customId,
        aggregateId,
      });

      expect(event.id).toBe(customId);
    });

    it('should freeze payload', () => {
      const aggregateId = UUID.generate();
      const payload: TestPayload = { userId: 'user-1', action: 'login' };

      const event = TestDomainEvent.create({
        occurredAt: Date.now(),
        schemaVersion: 1,
        aggregateId,
        payload,
      });

      expect(() => {
        (event.payload as any).userId = 'user-2';
      }).toThrow('Cannot assign to read only property');
    });
  });

  describe('toPrimitives', () => {
    it('should convert event to primitives', () => {
      const aggregateId = UUID.generate();
      const occurredAt = Date.now();
      const payload: TestPayload = { userId: 'user-1', action: 'login' };

      const event = TestDomainEvent.create({
        schemaVersion: 1,
        aggregateId,
        occurredAt,
        payload,
      });

      const primitives = event.toPrimitives();

      expect(primitives).toEqual({
        aggregateId: aggregateId.toString(),
        eventName: 'TestEvent',
        schemaVersion: 1,
        id: event.id,
        occurredAt,
        payload,
      });
    });

    it('should return primitives with correct structure', () => {
      const aggregateId = UUID.generate();
      const event = TestDomainEvent.create({
        payload: { userId: 'user-1', action: 'login' },
        occurredAt: Date.now(),
        schemaVersion: 1,
        aggregateId,
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
        payload: { userId: 'user-1', action: 'login' },
        occurredAt: Date.now(),
        schemaVersion: 1,
        aggregateId,
      });

      expect(event.eventName).toBe('TestEvent');
    });
  });

  describe('payload', () => {
    it('should store payload correctly', () => {
      const aggregateId = UUID.generate();
      const payload: TestPayload = { userId: 'user-1', action: 'login' };

      const event = TestDomainEvent.create({
        occurredAt: Date.now(),
        schemaVersion: 1,
        aggregateId,
        payload,
      });

      expect(event.payload).toEqual(payload);
      expect(event.payload.userId).toBe('user-1');
      expect(event.payload.action).toBe('login');
    });
  });
});
