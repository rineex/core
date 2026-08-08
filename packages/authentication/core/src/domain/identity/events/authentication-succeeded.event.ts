import { DomainEvent } from '@rineex/ddd';

import { AuthAttemptId } from '../value-objects/auth-attempt-id.vo';

/**
 * Emitted when an authentication attempt succeeds.
 */
export class AuthenticationSucceededEvent extends DomainEvent {
  constructor(public readonly attemptId: AuthAttemptId) {
    super({
      payload: {
        attemptId: attemptId.toString(),
      },
      eventName: 'authentication.auth_attempt.succeeded',
      id: crypto.randomUUID(),
      aggregateId: attemptId,
      occurredAt: Date.now(),
      schemaVersion: 1,
    });
  }
}
