import { AggregateRoot, CreateEntityProps } from '@rineex/ddd';

import { AuthenticationSucceededEvent } from '../events/authentication-succeeded.event';
import { AuthenticationStartedEvent } from '../events/authentication-started.event';
import { AuthenticationFailedEvent } from '../events/authentication-failed.event';
import { AuthAttemptId } from '../value-objects/auth-attempt-id.vo';
import { AuthStatus } from '../value-objects/auth-status.vo';
import { AuthMethod } from '../value-objects/auth-method.vo';
import { IdentityId } from '../value-objects/identity-id.vo';

interface AuthenticationAttemptProps extends CreateEntityProps<AuthAttemptId> {
  status: AuthStatus;
  method: AuthMethod;
  identityId?: IdentityId;
}

/**
 * Aggregate Root representing a single authentication attempt.
 *
 * Responsibilities:
 * - Enforce authentication lifecycle invariants
 * - Emit auditable domain events
 * - Prevent invalid state transitions
 *
 * This aggregate DOES NOT:
 * - Perform authentication
 * - Talk to infrastructure
 * - Know about HTTP or sessions
 */
export class AuthenticationAttempt extends AggregateRoot<AuthAttemptId> {
  /**
   * Current status of the authentication attempt.
   */
  private _status: AuthStatus;
  /**
   * Method used for authentication.
   */
  private _method: AuthMethod;
  /**
   * Optional identity being authenticated.
   */
  private _identityId?: IdentityId;

  private constructor({ createdAt, id, ...props }: AuthenticationAttemptProps) {
    super({
      createdAt,
      id,
    });
    this._status = props.status;
    this._method = props.method;
    this._identityId = props.identityId;
  }

  toObject(): Record<string, unknown> {
    return {
      identityId: this._identityId.getValue(),
      createdAt: this.createdAt,
      id: this.id.getValue(),
      status: this._status,
      method: this._method,
    };
  }

  /**
   * Factory method to start a new authentication attempt.
   */
  static start(
    id: AuthAttemptId,
    method: AuthMethod,
    identityId?: IdentityId,
  ): AuthenticationAttempt {
    const attempt = new AuthenticationAttempt({
      status: AuthStatus.create('PENDING'),
      identityId,
      method,
      id,
    });

    attempt.addEvent(new AuthenticationStartedEvent(id, method));

    return attempt;
  }

  /**
   * Marks the authentication attempt as successful.
   *
   * @throws Error if already completed
   */
  succeed(): void {
    if (this._status.isNot('PENDING')) {
      throw new Error('Authentication attempt already completed');
    }

    this.mutate(draft => {
      draft._status = AuthStatus.create('SUCCEEDED');
    });

    this.addEvent(new AuthenticationSucceededEvent(this.id));
  }

  /**
   * Marks the authentication attempt as failed.
   *
   * @throws Error if already completed
   */
  fail(reason: string): void {
    if (this._status.isNot('PENDING')) {
      throw new Error('Authentication attempt already completed');
    }

    if (!reason || reason.length < 3) {
      throw new Error('Failure reason must be provided');
    }

    this.mutate(draft => {
      draft._status = AuthStatus.create('FAILED');
    });

    this.addEvent(new AuthenticationFailedEvent(this.id));
  }

  /**
   * Aggregate invariant validation.
   *
   * Called automatically before domain events are added.
   */
  validate(): void {
    if (!this._method) {
      throw new Error('AuthenticationAttempt must have a method');
    }

    if (!this._status) {
      throw new Error('AuthenticationAttempt must have a status');
    }
  }
}
