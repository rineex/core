import { describe, expect, it } from 'vitest';

import {
  PasswordlessChallengeIssuedEvent,
  PasswordlessChallengeIssuedPayload,
} from '../passwordless-challenge-issued.event';
import { PasswordlessChallengeId } from '../..';

describe('passwordlessChallengeIssuedEvent', () => {
  const VALID_UUID_1 = '550e8400-e29b-41d4-a716-446655440000';
  const VALID_UUID_2 = '660e8400-e29b-41d4-a716-446655440001';
  const VALID_UUID_3 = '770e8400-e29b-41d4-a716-446655440002';

  describe('constructor', () => {
    it('should create a domain event with all properties', () => {
      const aggregateId = PasswordlessChallengeId.fromString(VALID_UUID_1);
      const occurredAt = Date.now();
      const expiresAt = new Date(occurredAt + 600000).toISOString();
      const payload: PasswordlessChallengeIssuedPayload = {
        destination: 'user@example.com',
        channel: 'email',
        expiresAt,
      };

      const event = PasswordlessChallengeIssuedEvent.create({
        schemaVersion: 1,
        aggregateId,
        occurredAt,
        payload,
      });

      expect(event.aggregateId).toBe(aggregateId);
      expect(event.eventName).toBe('auth.passwordless.challenge_created');
      expect(event.schemaVersion).toBe(1);
      expect(event.occurredAt).toBe(occurredAt);
      expect(event.payload).toEqual(payload);
      expect(event.id).toBeDefined();
      expect(typeof event.id).toBe('string');
    });

    it('should generate UUID if id not provided', () => {
      const aggregateId = PasswordlessChallengeId.fromString(VALID_UUID_1);
      const occurredAt = Date.now();
      const expiresAt = new Date(occurredAt + 600000).toISOString();
      const payload: PasswordlessChallengeIssuedPayload = {
        destination: '+1234567890',
        channel: 'sms',
        expiresAt,
      };

      const event1 = PasswordlessChallengeIssuedEvent.create({
        schemaVersion: 1,
        aggregateId,
        occurredAt,
        payload,
      });
      const event2 = PasswordlessChallengeIssuedEvent.create({
        schemaVersion: 1,
        aggregateId,
        occurredAt,
        payload,
      });

      expect(event1.id).toBeDefined();
      expect(event2.id).toBeDefined();
      expect(event1.id).not.toBe(event2.id);
    });

    it('should use provided id when specified', () => {
      const aggregateId = PasswordlessChallengeId.fromString(VALID_UUID_1);
      const customId = 'custom-event-id-123';
      const occurredAt = Date.now();
      const expiresAt = new Date(occurredAt + 600000).toISOString();
      const payload: PasswordlessChallengeIssuedPayload = {
        destination: 'user@example.com',
        channel: 'email',
        expiresAt,
      };

      const event = PasswordlessChallengeIssuedEvent.create({
        schemaVersion: 1,
        id: customId,
        aggregateId,
        occurredAt,
        payload,
      });

      expect(event.id).toBe(customId);
    });

    it('should freeze payload to prevent mutations', () => {
      const aggregateId = PasswordlessChallengeId.fromString(VALID_UUID_1);
      const occurredAt = Date.now();
      const expiresAt = new Date(occurredAt + 600000).toISOString();
      const payload: PasswordlessChallengeIssuedPayload = {
        destination: 'user@example.com',
        channel: 'email',
        expiresAt,
      };

      const event = PasswordlessChallengeIssuedEvent.create({
        schemaVersion: 1,
        aggregateId,
        occurredAt,
        payload,
      });

      expect(() => {
        (event.payload as any).channel = 'sms';
      }).toThrow('Cannot assign to read only property');
    });
  });

  describe('eventName', () => {
    it('should have correct event name', () => {
      const aggregateId = PasswordlessChallengeId.fromString(VALID_UUID_1);
      const occurredAt = Date.now();
      const expiresAt = new Date(occurredAt + 600000).toISOString();
      const payload: PasswordlessChallengeIssuedPayload = {
        destination: 'user@example.com',
        channel: 'email',
        expiresAt,
      };

      const event = PasswordlessChallengeIssuedEvent.create({
        schemaVersion: 1,
        aggregateId,
        occurredAt,
        payload,
      });

      expect(event.eventName).toBe('auth.passwordless.challenge_created');
    });
  });

  describe('payload', () => {
    it('should store payload correctly with email channel', () => {
      const aggregateId = PasswordlessChallengeId.fromString(VALID_UUID_1);
      const occurredAt = Date.now();
      const expiresAt = new Date(occurredAt + 600000).toISOString();
      const payload: PasswordlessChallengeIssuedPayload = {
        destination: 'user@example.com',
        channel: 'email',
        expiresAt,
      };

      const event = PasswordlessChallengeIssuedEvent.create({
        schemaVersion: 1,
        aggregateId,
        occurredAt,
        payload,
      });

      expect(event.payload).toEqual(payload);
      expect(event.payload.channel).toBe('email');
      expect(event.payload.destination).toBe('user@example.com');
      expect(event.payload.expiresAt).toBe(expiresAt);
    });

    it('should store payload correctly with SMS channel', () => {
      const aggregateId = PasswordlessChallengeId.fromString(VALID_UUID_2);
      const occurredAt = Date.now();
      const expiresAt = new Date(occurredAt + 300000).toISOString();
      const payload: PasswordlessChallengeIssuedPayload = {
        destination: '+1234567890',
        channel: 'sms',
        expiresAt,
      };

      const event = PasswordlessChallengeIssuedEvent.create({
        schemaVersion: 1,
        aggregateId,
        occurredAt,
        payload,
      });

      expect(event.payload).toEqual(payload);
      expect(event.payload.channel).toBe('sms');
      expect(event.payload.destination).toBe('+1234567890');
      expect(event.payload.expiresAt).toBe(expiresAt);
    });

    it('should handle different expiration times', () => {
      const aggregateId = PasswordlessChallengeId.fromString(VALID_UUID_3);
      const occurredAt = Date.now();
      const shortExpiry = new Date(occurredAt + 60000).toISOString();
      const longExpiry = new Date(occurredAt + 3600000).toISOString();

      const event1 = PasswordlessChallengeIssuedEvent.create({
        payload: {
          destination: 'user@example.com',
          expiresAt: shortExpiry,
          channel: 'email',
        },
        schemaVersion: 1,
        aggregateId,
        occurredAt,
      });

      const event2 = PasswordlessChallengeIssuedEvent.create({
        payload: {
          destination: '+1234567890',
          expiresAt: longExpiry,
          channel: 'sms',
        },
        schemaVersion: 1,
        aggregateId,
        occurredAt,
      });

      expect(event1.payload.expiresAt).toBe(shortExpiry);
      expect(event2.payload.expiresAt).toBe(longExpiry);
    });
  });

  describe('toPrimitives', () => {
    it('should convert event to primitives with correct structure', () => {
      const aggregateId = PasswordlessChallengeId.fromString(VALID_UUID_1);
      const occurredAt = Date.now();
      const expiresAt = new Date(occurredAt + 600000).toISOString();
      const payload: PasswordlessChallengeIssuedPayload = {
        destination: 'user@example.com',
        channel: 'email',
        expiresAt,
      };

      const event = PasswordlessChallengeIssuedEvent.create({
        schemaVersion: 1,
        aggregateId,
        occurredAt,
        payload,
      });

      const primitives = event.toPrimitives();

      expect(primitives).toEqual({
        eventName: 'auth.passwordless.challenge_created',
        aggregateId: aggregateId.toString(),
        schemaVersion: 1,
        id: event.id,
        occurredAt,
        payload,
      });
    });

    it('should return primitives with all required properties', () => {
      const aggregateId = PasswordlessChallengeId.fromString(VALID_UUID_1);
      const occurredAt = Date.now();
      const expiresAt = new Date(occurredAt + 600000).toISOString();
      const payload: PasswordlessChallengeIssuedPayload = {
        destination: 'user@example.com',
        channel: 'email',
        expiresAt,
      };

      const event = PasswordlessChallengeIssuedEvent.create({
        schemaVersion: 1,
        aggregateId,
        occurredAt,
        payload,
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
      const aggregateId = PasswordlessChallengeId.fromString(VALID_UUID_1);
      const occurredAt = Date.now();
      const expiresAt = new Date(occurredAt + 600000).toISOString();
      const payload: PasswordlessChallengeIssuedPayload = {
        destination: 'user@example.com',
        channel: 'email',
        expiresAt,
      };

      const event = PasswordlessChallengeIssuedEvent.create({
        schemaVersion: 1,
        aggregateId,
        occurredAt,
        payload,
      });

      const primitives = event.toPrimitives();

      expect(typeof primitives.aggregateId).toBe('string');
      expect(primitives.aggregateId).toBe(aggregateId.toString());
    });
  });

  describe('schemaVersion', () => {
    it('should store schema version correctly', () => {
      const aggregateId = PasswordlessChallengeId.fromString(VALID_UUID_1);
      const occurredAt = Date.now();
      const expiresAt = new Date(occurredAt + 600000).toISOString();
      const payload: PasswordlessChallengeIssuedPayload = {
        destination: 'user@example.com',
        channel: 'email',
        expiresAt,
      };

      const event = PasswordlessChallengeIssuedEvent.create({
        schemaVersion: 2,
        aggregateId,
        occurredAt,
        payload,
      });

      expect(event.schemaVersion).toBe(2);
    });
  });

  describe('aggregateId', () => {
    it('should store aggregate ID correctly', () => {
      const aggregateId1 = PasswordlessChallengeId.fromString(VALID_UUID_1);
      const aggregateId2 = PasswordlessChallengeId.fromString(VALID_UUID_2);
      const occurredAt = Date.now();
      const expiresAt = new Date(occurredAt + 600000).toISOString();
      const payload: PasswordlessChallengeIssuedPayload = {
        destination: 'user@example.com',
        channel: 'email',
        expiresAt,
      };

      const event1 = PasswordlessChallengeIssuedEvent.create({
        aggregateId: aggregateId1,
        schemaVersion: 1,
        occurredAt,
        payload,
      });

      const event2 = PasswordlessChallengeIssuedEvent.create({
        aggregateId: aggregateId2,
        schemaVersion: 1,
        occurredAt,
        payload,
      });

      expect(event1.aggregateId).toBe(aggregateId1);
      expect(event2.aggregateId).toBe(aggregateId2);
      expect(event1.aggregateId).not.toBe(event2.aggregateId);
    });
  });
});
