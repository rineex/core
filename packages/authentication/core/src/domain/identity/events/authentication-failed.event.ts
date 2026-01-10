import { DomainEvent } from '@rineex/ddd';

import { AuthAttemptId } from '../value-objects/auth-attempt-id.vo';

/**
 * Emitted when an authentication attempt failed.
 */
export class AuthenticationFailedEvent extends DomainEvent {
  public get eventName(): string {
    return 'authentication.auth_attempt.failed';
  }

  constructor(public readonly attemptId: AuthAttemptId) {
    super({
      payload: {
        attemptId: attemptId.toString(),
      },
      id: crypto.randomUUID(),
      aggregateId: attemptId,
      occurredAt: Date.now(),
      schemaVersion: 1,
    });
  }
}
