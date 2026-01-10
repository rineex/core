import { UUID } from '@rineex/ddd';

/**
 * Represents a globally unique identifier for an authentication attempt.
 *
 * This ID is used for:
 * - Correlation across logs
 * - Event causation
 * - Security auditing
 *
 * Must be generated externally (UUIDv7 recommended).
 */
export class AuthAttemptId extends UUID {
  public static create(value: string): AuthAttemptId {
    return new AuthAttemptId(value);
  }

  protected validate(value: string): void {
    if (!value || value.length < 16) {
      throw new Error('AuthAttemptId must be a valid non-empty identifier');
    }
  }
}
