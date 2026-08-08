import { DomainEvent } from '@rineex/ddd';

import { AuthAttemptId } from '../value-objects/auth-attempt-id.vo';

/**
 * Emitted when an authentication attempt failed.
 */
export class AuthenticationFailedEvent extends DomainEvent {
  constructor(
    public readonly attemptId: AuthAttemptId,
    reason?: string,
  ) {
    super({
      payload: {
        attemptId: attemptId.toString(),
        reason: reason ?? 'UNKNOWN',
      },
      eventName: 'authentication.auth_attempt.failed',
      id: crypto.randomUUID(),
      aggregateId: attemptId,
      occurredAt: Date.now(),
      schemaVersion: 1,
    });
  }
}
