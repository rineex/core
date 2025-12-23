import { DomainEvent } from '@rineex/ddd';

import { AuthAttemptId } from '../value-objects/auth-attempt-id.vo';
import { AuthMethod } from '../value-objects/auth-method.vo';

/**
 * Emitted when an authentication attempt begins.
 */
export class AuthenticationStartedEvent extends DomainEvent {
  public get eventName(): string {
    return 'authentication.authentication_started';
  }

  constructor(
    public readonly attemptId: AuthAttemptId,
    public readonly method: AuthMethod,
  ) {
    super({
      payload: {
        attemptId: attemptId.toString(),
        method: method.toString(),
      },
      aggregateId: attemptId.toString(),
      id: crypto.randomUUID(),
      occurredAt: Date.now(),
      schemaVersion: 1,
    });
  }
}
