import { AggregateRoot } from '@rineex/ddd';

import { AuthenticationSucceededEvent } from '../events/authentication-succeeded.event';
import { AuthenticationStartedEvent } from '../events/authentication-started.event';
import { AuthenticationFailedEvent } from '../events/authentication-failed.event';
import { AuthAttemptId } from '../value-objects/auth-attempt-id.vo';
import { AuthStatus } from '../value-objects/auth-status.vo';
import { AuthMethod } from '../value-objects/auth-method.vo';
import { IdentityId } from '../value-objects/identity-id.vo';

type Props = {
  status: AuthStatus;
  method: AuthMethod;
  identityId?: IdentityId;
};

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
export class AuthenticationAttempt extends AggregateRoot<Props> {
  private constructor(id: AuthAttemptId, props: Props) {
    super({
      createdAt: new Date(),
      props,
      id,
    });
  }

  // This "casts" the ID for this specific class only
  public override get id(): AuthAttemptId {
    return super.id as AuthAttemptId;
  }

  /**
   * Factory method to start a new authentication attempt.
   */
  static start(
    id: AuthAttemptId,
    method: AuthMethod,
    identityId?: IdentityId,
  ): AuthenticationAttempt {
    const attempt = new AuthenticationAttempt(id, {
      status: AuthStatus.create('PENDING'),
      identityId,
      method,
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
    if (this.props.status.isNot('PENDING')) {
      throw new Error('Authentication attempt already completed');
    }

    this.updateProps(props => ({
      ...props,
      status: AuthStatus.create('SUCCEEDED'),
    }));

    const ev = new AuthenticationSucceededEvent(this.id);

    this.addEvent(ev);
  }

  /**
   * Marks the authentication attempt as failed.
   *
   * @throws Error if already completed
   */
  fail(reason: string): void {
    if (this.props.status.isNot('PENDING')) {
      throw new Error('Authentication attempt already completed');
    }

    if (!reason || reason.length < 3) {
      throw new Error('Failure reason must be provided');
    }

    this.updateProps(props => ({
      ...props,
      status: AuthStatus.create('FAILED'),
    }));

    this.addEvent(new AuthenticationFailedEvent(this.id));
  }

  /**
   * Aggregate invariant validation.
   *
   * Called automatically before domain events are added.
   */
  validate(): void {
    if (!this.props.method) {
      throw new Error('AuthenticationAttempt must have a method');
    }

    if (!this.props.status) {
      throw new Error('AuthenticationAttempt must have a status');
    }
  }
}
