import { JsonValue } from 'type-fest';

import { deepFreeze } from '@/utils';

import { EntityId } from '../types';

type Serializable = JsonValue;

export type DomainEventPayload = Record<string, Serializable>;

export type UnixTimestampMillis = number;

type DomainEventProps<Payload, AggregateId extends EntityId> = {
  id: string;
  eventName: string;
  aggregateId: AggregateId;
  schemaVersion: number;
  occurredAt: UnixTimestampMillis;
  payload: Payload;
};

export type CreateEventProps<
  EventProps,
  ID extends EntityId,
> = DomainEventProps<EventProps, ID>;

// Abstract base class for domain events
export abstract class DomainEvent<
  AggregateId extends EntityId = EntityId,
  T extends DomainEventPayload = DomainEventPayload,
> {
  public readonly aggregateId: AggregateId;

  public readonly eventName: string;
  public readonly id: string;
  public readonly occurredAt: number;
  public readonly payload: Readonly<T>;
  public readonly schemaVersion: number;

  protected constructor(props: DomainEventProps<T, AggregateId>) {
    if (typeof props.id !== 'string' || !props.id.trim()) {
      throw new Error('Domain event ID is required');
    }
    if (typeof props.eventName !== 'string' || !props.eventName.trim()) {
      throw new Error('Event name is required');
    }
    if (!Number.isInteger(props.schemaVersion) || props.schemaVersion < 1) {
      throw new Error('Event schema version must be a positive integer');
    }
    if (!Number.isInteger(props.occurredAt) || props.occurredAt < 0) {
      throw new Error(
        'Event occurrence timestamp must be a valid Unix timestamp',
      );
    }

    DomainEvent.assertSerializable(props.payload);

    this.eventName = props.eventName;
    this.id = props.id;
    this.aggregateId = props.aggregateId;
    this.schemaVersion = props.schemaVersion;
    this.occurredAt = props.occurredAt;
    this.payload = deepFreeze(props.payload);
  }

  private static assertSerializable(
    value: unknown,
    seen = new WeakSet<object>(),
  ): void {
    if (
      value === null ||
      typeof value === 'string' ||
      typeof value === 'boolean'
    ) {
      return;
    }

    if (typeof value === 'number') {
      if (Number.isFinite(value)) return;
      throw new Error('Event payload must contain finite numbers');
    }

    if (typeof value !== 'object') {
      throw new Error('Event payload must contain JSON-safe values');
    }

    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new Error('Event payload must contain JSON-safe values');
    }

    if (seen.has(value)) {
      throw new Error('Event payload cannot contain circular references');
    }
    seen.add(value);

    if (Array.isArray(value)) {
      for (const item of value) DomainEvent.assertSerializable(item, seen);
      seen.delete(value);
      return;
    }

    for (const item of Object.values(value)) {
      DomainEvent.assertSerializable(item, seen);
    }
    seen.delete(value);
  }

  public toPrimitives(): Readonly<{
    id: string;
    eventName: string;
    aggregateId: string;
    schemaVersion: number;
    occurredAt: UnixTimestampMillis;
    payload: T;
  }> {
    return {
      aggregateId: this.aggregateId.toString(),
      schemaVersion: this.schemaVersion,
      occurredAt: this.occurredAt,
      eventName: this.eventName,
      payload: this.payload,
      id: this.id,
    };
  }
}
