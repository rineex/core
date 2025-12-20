type Primitive = boolean | number | string | null;

type Serializable =
  | Primitive
  | Serializable[]
  | { [key: string]: Serializable };

export type DomainEventPayload = Record<string, Serializable>;

type DomainEventProps<T> = {
  id: string;
  aggregateId: string;
  schemaVersion: number;
  occurredAt: number;
  payload: T;
};

// Abstract base class for domain events
export abstract class DomainEvent<
  T extends DomainEventPayload = DomainEventPayload,
> {
  public abstract readonly eventName: string;

  public readonly id: string;
  public readonly aggregateId: string;
  public readonly schemaVersion: number;
  public readonly occurredAt: number;
  public readonly payload: Readonly<T>;

  protected constructor(props: DomainEventProps<T>) {
    this.id = props.id;
    this.aggregateId = props.aggregateId;
    this.schemaVersion = props.schemaVersion;
    this.occurredAt = props.occurredAt;
    this.payload = Object.freeze(props.payload);
  }

  public toPrimitives() {
    return {
      schemaVersion: this.schemaVersion,
      aggregateId: this.aggregateId,
      occurredAt: this.occurredAt,
      eventName: this.eventName,
      payload: this.payload,
      id: this.id,
    };
  }
}
