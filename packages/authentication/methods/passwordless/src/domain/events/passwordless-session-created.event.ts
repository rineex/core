import { AggregateId, CreateEventProps, DomainEvent } from '@rineex/ddd';

type Props = {
  email: string;
  issuedAt: string;
  expiresAt: string;
};

export class PasswordlessSessionCreatedEvent extends DomainEvent<Props> {
  public readonly eventName = 'auth.passwordless.session_created';

  public static create({
    payload,
    aggregateId,
    occurredAt,
    schemaVersion,
    id,
  }: CreateEventProps<Props>) {
    return new PasswordlessSessionCreatedEvent({
      occurredAt,
      id,
      schemaVersion,
      payload,
      aggregateId,
    });
  }
}
