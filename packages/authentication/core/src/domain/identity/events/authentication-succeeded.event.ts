import { DomainEvent } from '@rineex/ddd';

import { AuthAttemptId } from '../value-objects/auth-attempt-id.vo';

/**
 * Emitted when an authentication attempt succeeds.
 */
export class AuthenticationSucceededEvent extends DomainEvent {
  public get eventName(): string {
    return 'authentication.auth_attempt.succeeded';
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
