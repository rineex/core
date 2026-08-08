import { DomainEvent } from '@rineex/ddd';

import { IdentityId } from '../value-objects/identity-id.vo';

export type IdentityCreatedPayload = {
  identityId: string;
};

export class IdentityCreatedEvent extends DomainEvent<
  IdentityId,
  IdentityCreatedPayload
> {
  public static create(identityId: IdentityId): IdentityCreatedEvent {
    return new IdentityCreatedEvent({
      id: crypto.randomUUID(),
      eventName: 'auth.identity.created',
      payload: { identityId: identityId.toString() },
      aggregateId: identityId,
      occurredAt: Date.now(),
      schemaVersion: 1,
    });
  }
}
