import { AggregateRoot, EntityProps } from '@rineex/ddd';

import {
  AuthenticationFailedEvent,
  AuthenticationStartedEvent,
  AuthenticationSucceededEvent,
} from '../events';
import {
  AuthAttemptId,
  AuthFactor,
  AuthMethod,
  AuthStatus,
  RiskSignal,
} from '../value-objects';
import { InvalidAuthenticationTransitionError } from '../errors/invalid-authentication-transition.error';
import { AuthenticationAttemptExceeded } from '../errors/authentication-attempt.error';

export interface AuthenticationAttemptProps {
  readonly method: AuthMethod;
  readonly status: AuthStatus;
  readonly factors: readonly AuthFactor[];
  readonly attempts: number;
  readonly maxAttempts: number;
  readonly riskSignals: readonly RiskSignal[];
}

type CreateAuthAttemptProps = EntityProps<
  AuthAttemptId,
  AuthenticationAttemptProps
>;

type StartAuthenticationProps = {
  id: AuthAttemptId;
  method: AuthMethod;
  maxAttempts: number;
  riskSignals?: readonly RiskSignal[];
};

export class AuthenticationAttempt extends AggregateRoot<
  AuthAttemptId,
  AuthenticationAttemptProps
> {
  /**
   * Checks whether the maximum number of authentication attempts has been reached or exceeded.
   *
   * @returns `true` if the current number of attempts is greater than or equal to the maximum allowed attempts, `false` otherwise.
   */
  public get hasReachedMaxAttempts(): boolean {
    return this.props.attempts >= this.props.maxAttempts;
  }

  /** Public accessor for the auth method name; used by application services (e.g. resolver). */
  public get methodValue(): AuthMethod['value'] {
    return this.props.method.value;
  }

  private constructor(props: CreateAuthAttemptProps) {
    super(props);
  }

  public static start(props: StartAuthenticationProps): AuthenticationAttempt {
    const attempt = new AuthenticationAttempt({
      props: {
        riskSignals: props.riskSignals ?? [],
        status: AuthStatus.create('pending'),
        maxAttempts: props.maxAttempts,
        method: props.method,
        attempts: 0,
        factors: [],
      },
      id: props.id,
    });

    attempt.addEvent(new AuthenticationStartedEvent(attempt.id, props.method));

    return attempt;
  }

  /**
   * Mark authentication as failed.
   */
  public fail(reason: string): void {
    const isFinal = this.props.status.isFinal;
    if (isFinal) {
      throw InvalidAuthenticationTransitionError.create(
        'Authentication Finished before',
        {
          status: this.props.status.value,
        },
      );
    }

    this.mutate(current => ({
      ...current,
      status: AuthStatus.create('failed'),
    }));

    this.addEvent(new AuthenticationFailedEvent(this.id, reason));
  }

  public registerAttempt(factor: AuthFactor): void {
    if (this.props.status.isFinal) {
      throw InvalidAuthenticationTransitionError.create(
        'Authentication Finished',
        {
          status: this.props.status.value,
        },
      );
      //
    }

    if (this.hasReachedMaxAttempts) {
      throw new AuthenticationAttemptExceeded({
        attempts: this.props.attempts,
        attemptId: this.id.value,
      });
    }

    this.mutate(current => ({
      ...current,

      factors: [...current.factors, factor],
      attempts: current.attempts + 1,
    }));
  }

  /**
   * Mark authentication as successful.
   */
  public succeed(): void {
    if (this.props.status.isFinal) {
      throw InvalidAuthenticationTransitionError.create(
        'Authentication Finished before',
        {
          status: this.props.status.value,
        },
      );
    }

    this.mutate(current => ({
      ...current,
      status: AuthStatus.create('succeed'),
    }));

    this.addEvent(new AuthenticationSucceededEvent(this.id));
  }

  toObject() {
    return {
      riskSignal: this.props.riskSignals.map(r => r.toString()),
      factor: this.props.factors.map(f => f.toString()),
      status: this.props.status.value,
      attempt: this.props.attempts,
    };
  }

  validate(): void {
    if (this.props.maxAttempts <= 0) {
      throw new Error('maxAttempts must be > 0');
    }
  }

  private ensureNotFinal(): void {
    const isFinal = this.props.status.isFinal;

    if (isFinal) {
      throw InvalidAuthenticationTransitionError.create(
        'Authentication is not completed yet',
        {
          status: this.props.status.value,
        },
      );
    }
  }
}
