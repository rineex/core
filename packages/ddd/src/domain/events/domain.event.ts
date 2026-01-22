import { randomUUID } from 'node:crypto';

import { deepFreeze } from '@/utils';

import { EntityId } from '../types';

type Primitive = boolean | number | string | null;

type Serializable =
  | Primitive
  | Serializable[]
  | { [key: string]: Serializable };

export type DomainEventPayload = Record<string, Serializable>;

export type UnixTimestampMillis = number;

type DomainEventProps<Payload, AggregateId extends EntityId> = {
  id?: string;
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

  public abstract readonly eventName: string;
  public readonly id: string;
  public readonly occurredAt: number;
  public readonly payload: Readonly<T>;
  public readonly schemaVersion: number;

  protected constructor(props: DomainEventProps<T, AggregateId>) {
    this.id = props.id ?? randomUUID();
    this.aggregateId = props.aggregateId;
    this.schemaVersion = props.schemaVersion;
    this.occurredAt = props.occurredAt;
    this.payload = deepFreeze(props.payload);
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
