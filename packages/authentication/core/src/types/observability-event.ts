/**
 * Base structure for observability events.
 *
 * These events:
 * - are NOT domain events
 * - must be safe to store long-term
 * - must never contain secrets
 */
export type ObservabilityEventProps = {
  readonly name: string;
  readonly occurredAt?: Date;
  readonly payload: Readonly<Record<string, unknown>>;
};

export class ObservabilityEvent {
  public readonly name: string;
  public readonly occurredAt: Date;
  public readonly payload: Readonly<Record<string, unknown>>;

  constructor(props: ObservabilityEventProps) {
    this.name = props.name;
    this.occurredAt = props.occurredAt ?? new Date();
    this.payload = props.payload;
  }

  toPrimitives() {
    return {
      occurredAt: this.occurredAt.toISOString(),
      payload: this.payload,
      name: this.name,
    };
  }
}
