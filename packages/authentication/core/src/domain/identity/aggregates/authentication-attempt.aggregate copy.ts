import { AggregateRoot, EntityProps } from '@rineex/ddd';

import {
  AuthenticationAttemptAlreadyCompletedError,
  AuthenticationAttemptFailureReasonRequiredError,
  AuthenticationAttemptMethodRequiredError,
  AuthenticationAttemptStatusRequiredError,
} from '../errors/authentication-attempt.error';
import { AuthenticationSucceededEvent } from '../events/authentication-succeeded.event';
import { AuthenticationStartedEvent } from '../events/authentication-started.event';
import { AuthenticationFailedEvent } from '../events/authentication-failed.event';
import { AuthAttemptId } from '../value-objects/auth-attempt-id.vo';
import { AuthStatus } from '../value-objects/auth-status.vo';
import { AuthMethod } from '../value-objects/auth-method.vo';
import { IdentityId } from '../value-objects/identity-id.vo';

interface AuthenticationAttemptProps {
  /**
   * Current status of the authentication attempt.
   */
  status: AuthStatus;
  /**
   * Method used for authentication.
   */
  method: AuthMethod;
  /**
   * Optional identity being authenticated.
   */
  identityId: IdentityId;
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
export class AuthenticationAttempt extends AggregateRoot<
  AuthAttemptId,
  AuthenticationAttemptProps
> {
  private constructor(
    params: EntityProps<AuthAttemptId, AuthenticationAttemptProps>,
  ) {
    super({ ...params });
  }

  /**
   * Factory method to start a new authentication attempt.
   */
  static start(
    id: AuthAttemptId,
    method: AuthMethod,
    identityId: IdentityId,
  ): AuthenticationAttempt {
    const attempt = new AuthenticationAttempt({
      props: {
        status: AuthStatus.create('PENDING'),
        identityId,
        method,
      },
      id,
    });

    attempt.addEvent(new AuthenticationStartedEvent(id, method));

    return attempt;
  }

  /**
   * Marks the authentication attempt as failed.
   *
   * @throws Error if already completed
   */
  fail(reason: string): void {
    if (this.props.status.isNot('PENDING')) {
      throw new AuthenticationAttemptAlreadyCompletedError({
        identityId: this.props.identityId?.value,
        status: this.props.status.value,
      });
    }

    if (!reason || reason.length < 3) {
      throw new AuthenticationAttemptFailureReasonRequiredError({
        identityId: this.props.identityId?.value,
        reason: reason || undefined,
      });
    }

    this.mutate(current => ({
      ...current,
      status: AuthStatus.create('FAILED'),
    }));

    this.addEvent(new AuthenticationFailedEvent(this.id));
  }

  /**
   * Marks the authentication attempt as successful.
   *
   * @throws Error if already completed
   */
  succeed(): void {
    if (this.props.status.isNot('PENDING')) {
      throw new AuthenticationAttemptAlreadyCompletedError({
        identityId: this.props.identityId?.value,
        status: this.props.status.value,
        attemptId: this.id.value,
      });
    }

    this.mutate(current => ({
      ...current,
      status: AuthStatus.create('SUCCEEDED'),
    }));

    this.addEvent(new AuthenticationSucceededEvent(this.id));
  }

  toObject() {
    return {
      identityId: this.props.identityId?.value,
      method: this.props.method.toString(),
      status: this.props.status.value,
      createdAt: this.createdAt,
      id: this.id.value,
    };
  }

  /**
   * Aggregate invariant validation.
   *
   * Called automatically before domain events are added.
   */
  validate(): void {
    if (!this.props.method) {
      throw new AuthenticationAttemptMethodRequiredError({
        identityId: this.props.identityId?.value,
        attemptId: this.id.value,
      });
    }

    if (!this.props.status) {
      throw new AuthenticationAttemptStatusRequiredError({
        identityId: this.props.identityId?.value,
        attemptId: this.id.value,
      });
    }
  }
}
