import { DomainEvent } from '@rineex/ddd';

import { IdentityId } from '../value-objects/identity-id.vo';

export type Payload = {
  identityId: string;
};

export class IdentityDisabledEvent extends DomainEvent<IdentityId, Payload> {
  public readonly eventName = 'auth.identity.disabled';

  public static create(identityId: IdentityId): IdentityDisabledEvent {
    return new IdentityDisabledEvent({
      payload: { identityId: identityId.toString() },
      aggregateId: identityId,
      occurredAt: Date.now(),
      schemaVersion: 1,
    });
  }
}
