import { ApplicationServicePort, Result } from '@rineex/ddd';

import {
  AuthenticationAttemptRepositoryPort,
  DomainEventPublisherPort,
} from '@/ports';
import { AuthenticationAttemptNotFound } from '@/domain/identity/errors';
import { AuthAttemptId, AuthenticationAttempt } from '@/domain';
import { AuthMethodName } from '@/types';

import { AuthenticationMethodResolver } from '../authentication-method-resolver';

type Input = {
  attemptId: AuthAttemptId;
  method: AuthMethodName;
  ctx: unknown;
};

type Output = Result<void, AuthenticationAttemptNotFound>;

/**
 * Application service that starts an authentication flow for a given attempt.
 * Resolves the auth method, invokes it, and publishes resulting domain events.
 */
export class StartAuthenticationFlowApplicationService implements ApplicationServicePort<
  Input,
  Output
> {
  constructor(
    private readonly attempts: AuthenticationAttemptRepositoryPort,
    private readonly methods: AuthenticationMethodResolver,
    private readonly events: DomainEventPublisherPort,
  ) {}

  /**
   * Starts the authentication flow for the given attempt using the specified method.
   * @param params - Contains attemptId, method name, and method-specific context
   * @returns Ok when the flow completes; fail with {@link AuthenticationAttemptNotFound} if attempt not found
   */
  async execute(params: Input): Promise<Output> {
    const method = this.methods.resolve(params.method);

    const attempt = await this.attempts.findById(params.attemptId);

    if (!attempt) {
      return Result.fail(
        new AuthenticationAttemptNotFound({
          attemptId: params.attemptId.toString(),
        }),
      );
    }

    const outcome = method.start({
      authAttemptId: params.attemptId,
      ctx: params.ctx,
    });

    if (!outcome.ok) {
      const error = outcome;
      attempt.fail(error.violation.toString());
    }

    await this.attempts.save(attempt);
    await this.publish(attempt);

    return Result.ok(undefined);
  }

  /**
   * Publishes all domain events from the authentication attempt.
   *
   * Extracts domain events from the aggregate and publishes them through
   * the domain event publisher. Events are published as a batch to ensure
   * atomicity and better performance.
   *
   * @param attempt - The authentication attempt aggregate containing domain events
   * @returns Promise that resolves when all events have been published
   * @throws Re-throws any errors from the event publisher
   */
  private async publish(attempt: AuthenticationAttempt): Promise<void> {
    const events = attempt.pullDomainEvents();

    if (events.length === 0) {
      return;
    }

    await this.events.publish(events);
  }
}
