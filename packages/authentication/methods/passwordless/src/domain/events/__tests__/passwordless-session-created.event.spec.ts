import { describe, expect, it } from 'vitest';

import { AggregateId } from '@rineex/ddd';

import {
  PasswordlessSessionCreatedEvent,
  PasswordlessSessionCreatedPayload,
} from '../passwordless-session-created.event';

describe('PasswordlessSessionCreatedEvent', () => {
  describe('constructor', () => {
    it('should create a domain event with all properties', () => {
      const aggregateId = AggregateId.generate();
      const occurredAt = Date.now();
      const issuedAt = new Date(occurredAt).toISOString();
      const expiresAt = new Date(occurredAt + 3600000).toISOString();
      const payload: PasswordlessSessionCreatedPayload = {
        email: 'user@example.com',
        issuedAt,
        expiresAt,
      };

      const event = PasswordlessSessionCreatedEvent.create({
        schemaVersion: 1,
        aggregateId,
        occurredAt,
        payload,
      });

      expect(event.aggregateId).toBe(aggregateId);
      expect(event.eventName).toBe('auth.passwordless.session_created');
      expect(event.schemaVersion).toBe(1);
      expect(event.occurredAt).toBe(occurredAt);
      expect(event.payload).toEqual(payload);
      expect(event.id).toBeDefined();
      expect(typeof event.id).toBe('string');
    });

    it('should generate UUID if id not provided', () => {
      const aggregateId = AggregateId.generate();
      const occurredAt = Date.now();
      const issuedAt = new Date(occurredAt).toISOString();
      const expiresAt = new Date(occurredAt + 3600000).toISOString();
      const payload: PasswordlessSessionCreatedPayload = {
        email: 'user@example.com',
        issuedAt,
        expiresAt,
      };

      const event1 = PasswordlessSessionCreatedEvent.create({
        payload,
        occurredAt,
        schemaVersion: 1,
        aggregateId,
      });
      const event2 = PasswordlessSessionCreatedEvent.create({
        payload,
        occurredAt,
        schemaVersion: 1,
        aggregateId,
      });

      expect(event1.id).toBeDefined();
      expect(event2.id).toBeDefined();
      expect(event1.id).not.toBe(event2.id);
    });

    it('should use provided id when specified', () => {
      const aggregateId = AggregateId.generate();
      const customId = 'custom-event-id-123';
      const occurredAt = Date.now();
      const issuedAt = new Date(occurredAt).toISOString();
      const expiresAt = new Date(occurredAt + 3600000).toISOString();
      const payload: PasswordlessSessionCreatedPayload = {
        email: 'user@example.com',
        issuedAt,
        expiresAt,
      };

      const event = PasswordlessSessionCreatedEvent.create({
        payload,
        occurredAt,
        schemaVersion: 1,
        id: customId,
        aggregateId,
      });

      expect(event.id).toBe(customId);
    });

    it('should freeze payload to prevent mutations', () => {
      const aggregateId = AggregateId.generate();
      const occurredAt = Date.now();
      const issuedAt = new Date(occurredAt).toISOString();
      const expiresAt = new Date(occurredAt + 3600000).toISOString();
      const payload: PasswordlessSessionCreatedPayload = {
        email: 'user@example.com',
        issuedAt,
        expiresAt,
      };

      const event = PasswordlessSessionCreatedEvent.create({
        occurredAt,
        schemaVersion: 1,
        aggregateId,
        payload,
      });

      expect(() => {
        (event.payload as any).email = 'other@example.com';
      }).toThrow('Cannot assign to read only property');
    });
  });

  describe('eventName', () => {
    it('should have correct event name', () => {
      const aggregateId = AggregateId.generate();
      const occurredAt = Date.now();
      const issuedAt = new Date(occurredAt).toISOString();
      const expiresAt = new Date(occurredAt + 3600000).toISOString();
      const payload: PasswordlessSessionCreatedPayload = {
        email: 'user@example.com',
        issuedAt,
        expiresAt,
      };

      const event = PasswordlessSessionCreatedEvent.create({
        payload,
        occurredAt,
        schemaVersion: 1,
        aggregateId,
      });

      expect(event.eventName).toBe('auth.passwordless.session_created');
    });
  });

  describe('payload', () => {
    it('should store payload correctly with all fields', () => {
      const aggregateId = AggregateId.generate();
      const occurredAt = Date.now();
      const issuedAt = new Date(occurredAt).toISOString();
      const expiresAt = new Date(occurredAt + 3600000).toISOString();
      const payload: PasswordlessSessionCreatedPayload = {
        email: 'user@example.com',
        issuedAt,
        expiresAt,
      };

      const event = PasswordlessSessionCreatedEvent.create({
        occurredAt,
        schemaVersion: 1,
        aggregateId,
        payload,
      });

      expect(event.payload).toEqual(payload);
      expect(event.payload.email).toBe('user@example.com');
      expect(event.payload.issuedAt).toBe(issuedAt);
      expect(event.payload.expiresAt).toBe(expiresAt);
    });

    it('should handle different email addresses', () => {
      const aggregateId = AggregateId.generate();
      const occurredAt = Date.now();
      const issuedAt = new Date(occurredAt).toISOString();
      const expiresAt = new Date(occurredAt + 3600000).toISOString();

      const event1 = PasswordlessSessionCreatedEvent.create({
        occurredAt,
        schemaVersion: 1,
        aggregateId,
        payload: {
          email: 'user1@example.com',
          issuedAt,
          expiresAt,
        },
      });

      const event2 = PasswordlessSessionCreatedEvent.create({
        occurredAt,
        schemaVersion: 1,
        aggregateId,
        payload: {
          email: 'user2@example.com',
          issuedAt,
          expiresAt,
        },
      });

      expect(event1.payload.email).toBe('user1@example.com');
      expect(event2.payload.email).toBe('user2@example.com');
    });

    it('should handle different expiration times', () => {
      const aggregateId = AggregateId.generate();
      const occurredAt = Date.now();
      const issuedAt = new Date(occurredAt).toISOString();
      const shortExpiry = new Date(occurredAt + 600000).toISOString();
      const longExpiry = new Date(occurredAt + 7200000).toISOString();

      const event1 = PasswordlessSessionCreatedEvent.create({
        occurredAt,
        schemaVersion: 1,
        aggregateId,
        payload: {
          email: 'user@example.com',
          issuedAt,
          expiresAt: shortExpiry,
        },
      });

      const event2 = PasswordlessSessionCreatedEvent.create({
        occurredAt,
        schemaVersion: 1,
        aggregateId,
        payload: {
          email: 'user@example.com',
          issuedAt,
          expiresAt: longExpiry,
        },
      });

      expect(event1.payload.expiresAt).toBe(shortExpiry);
      expect(event2.payload.expiresAt).toBe(longExpiry);
    });

    it('should handle different issuedAt timestamps', () => {
      const aggregateId = AggregateId.generate();
      const occurredAt1 = Date.now();
      const occurredAt2 = occurredAt1 + 1000;
      const issuedAt1 = new Date(occurredAt1).toISOString();
      const issuedAt2 = new Date(occurredAt2).toISOString();
      const expiresAt1 = new Date(occurredAt1 + 3600000).toISOString();
      const expiresAt2 = new Date(occurredAt2 + 3600000).toISOString();

      const event1 = PasswordlessSessionCreatedEvent.create({
        occurredAt: occurredAt1,
        schemaVersion: 1,
        aggregateId,
        payload: {
          email: 'user@example.com',
          issuedAt: issuedAt1,
          expiresAt: expiresAt1,
        },
      });

      const event2 = PasswordlessSessionCreatedEvent.create({
        occurredAt: occurredAt2,
        schemaVersion: 1,
        aggregateId,
        payload: {
          email: 'user@example.com',
          issuedAt: issuedAt2,
          expiresAt: expiresAt2,
        },
      });

      expect(event1.payload.issuedAt).toBe(issuedAt1);
      expect(event2.payload.issuedAt).toBe(issuedAt2);
      expect(event1.payload.issuedAt).not.toBe(event2.payload.issuedAt);
    });
  });

  describe('toPrimitives', () => {
    it('should convert event to primitives with correct structure', () => {
      const aggregateId = AggregateId.generate();
      const occurredAt = Date.now();
      const issuedAt = new Date(occurredAt).toISOString();
      const expiresAt = new Date(occurredAt + 3600000).toISOString();
      const payload: PasswordlessSessionCreatedPayload = {
        email: 'user@example.com',
        issuedAt,
        expiresAt,
      };

      const event = PasswordlessSessionCreatedEvent.create({
        schemaVersion: 1,
        aggregateId,
        occurredAt,
        payload,
      });

      const primitives = event.toPrimitives();

      expect(primitives).toEqual({
        aggregateId: aggregateId.toString(),
        eventName: 'auth.passwordless.session_created',
        schemaVersion: 1,
        id: event.id,
        occurredAt,
        payload,
      });
    });

    it('should return primitives with all required properties', () => {
      const aggregateId = AggregateId.generate();
      const occurredAt = Date.now();
      const issuedAt = new Date(occurredAt).toISOString();
      const expiresAt = new Date(occurredAt + 3600000).toISOString();
      const payload: PasswordlessSessionCreatedPayload = {
        email: 'user@example.com',
        issuedAt,
        expiresAt,
      };

      const event = PasswordlessSessionCreatedEvent.create({
        payload,
        occurredAt,
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

    it('should convert aggregateId to string in primitives', () => {
      const aggregateId = AggregateId.generate();
      const occurredAt = Date.now();
      const issuedAt = new Date(occurredAt).toISOString();
      const expiresAt = new Date(occurredAt + 3600000).toISOString();
      const payload: PasswordlessSessionCreatedPayload = {
        email: 'user@example.com',
        issuedAt,
        expiresAt,
      };

      const event = PasswordlessSessionCreatedEvent.create({
        payload,
        occurredAt,
        schemaVersion: 1,
        aggregateId,
      });

      const primitives = event.toPrimitives();

      expect(typeof primitives.aggregateId).toBe('string');
      expect(primitives.aggregateId).toBe(aggregateId.toString());
    });
  });

  describe('schemaVersion', () => {
    it('should store schema version correctly', () => {
      const aggregateId = AggregateId.generate();
      const occurredAt = Date.now();
      const issuedAt = new Date(occurredAt).toISOString();
      const expiresAt = new Date(occurredAt + 3600000).toISOString();
      const payload: PasswordlessSessionCreatedPayload = {
        email: 'user@example.com',
        issuedAt,
        expiresAt,
      };

      const event = PasswordlessSessionCreatedEvent.create({
        payload,
        occurredAt,
        schemaVersion: 2,
        aggregateId,
      });

      expect(event.schemaVersion).toBe(2);
    });
  });

  describe('aggregateId', () => {
    it('should store aggregate ID correctly', () => {
      const aggregateId1 = AggregateId.generate();
      const aggregateId2 = AggregateId.generate();
      const occurredAt = Date.now();
      const issuedAt = new Date(occurredAt).toISOString();
      const expiresAt = new Date(occurredAt + 3600000).toISOString();
      const payload: PasswordlessSessionCreatedPayload = {
        email: 'user@example.com',
        issuedAt,
        expiresAt,
      };

      const event1 = PasswordlessSessionCreatedEvent.create({
        payload,
        occurredAt,
        schemaVersion: 1,
        aggregateId: aggregateId1,
      });

      const event2 = PasswordlessSessionCreatedEvent.create({
        payload,
        occurredAt,
        schemaVersion: 1,
        aggregateId: aggregateId2,
      });

      expect(event1.aggregateId).toBe(aggregateId1);
      expect(event2.aggregateId).toBe(aggregateId2);
      expect(event1.aggregateId).not.toBe(event2.aggregateId);
    });
  });

  describe('occurredAt', () => {
    it('should store occurredAt timestamp correctly', () => {
      const aggregateId = AggregateId.generate();
      const occurredAt1 = Date.now();
      const occurredAt2 = occurredAt1 + 5000;
      const issuedAt1 = new Date(occurredAt1).toISOString();
      const issuedAt2 = new Date(occurredAt2).toISOString();
      const expiresAt1 = new Date(occurredAt1 + 3600000).toISOString();
      const expiresAt2 = new Date(occurredAt2 + 3600000).toISOString();
      const payload: PasswordlessSessionCreatedPayload = {
        email: 'user@example.com',
        issuedAt: issuedAt1,
        expiresAt: expiresAt1,
      };

      const event1 = PasswordlessSessionCreatedEvent.create({
        payload: { ...payload, issuedAt: issuedAt1, expiresAt: expiresAt1 },
        occurredAt: occurredAt1,
        schemaVersion: 1,
        aggregateId,
      });

      const event2 = PasswordlessSessionCreatedEvent.create({
        payload: { ...payload, issuedAt: issuedAt2, expiresAt: expiresAt2 },
        occurredAt: occurredAt2,
        schemaVersion: 1,
        aggregateId,
      });

      expect(event1.occurredAt).toBe(occurredAt1);
      expect(event2.occurredAt).toBe(occurredAt2);
      expect(event2.occurredAt).toBeGreaterThan(event1.occurredAt);
    });
  });
});
