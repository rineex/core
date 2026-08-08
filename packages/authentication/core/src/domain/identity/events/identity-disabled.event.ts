import { DomainEvent } from '@rineex/ddd';

import { IdentityId } from '../value-objects/identity-id.vo';

export type Payload = {
  identityId: string;
};

export class IdentityDisabledEvent extends DomainEvent<IdentityId, Payload> {
  public static create(identityId: IdentityId): IdentityDisabledEvent {
    return new IdentityDisabledEvent({
      id: crypto.randomUUID(),
      eventName: 'auth.identity.disabled',
      payload: { identityId: identityId.toString() },
      aggregateId: identityId,
      occurredAt: Date.now(),
      schemaVersion: 1,
    });
  }
}
