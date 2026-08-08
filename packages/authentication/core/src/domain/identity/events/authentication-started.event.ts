import { DomainEvent } from '@rineex/ddd';

import { AuthAttemptId } from '../value-objects/auth-attempt-id.vo';
import { AuthMethod } from '../value-objects/auth-method.vo';

/**
 * Emitted when an authentication attempt begins.
 */
export class AuthenticationStartedEvent extends DomainEvent {
  constructor(
    public readonly attemptId: AuthAttemptId,
    public readonly method: AuthMethod,
  ) {
    super({
      payload: {
        attemptId: attemptId.toString(),
        method: method.toString(),
      },
      eventName: 'authentication.authentication_started',
      id: crypto.randomUUID(),
      aggregateId: attemptId,
      occurredAt: Date.now(),
      schemaVersion: 1,
    });
  }
}
