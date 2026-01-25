import { ApplicationServicePort, Result } from '@rineex/ddd';

import { AuthenticationAttemptNotFound } from '@/domain/identity/errors/authentication-attempt.error';
import {
  AuthenticationAttemptRepositoryPort,
  DomainEventPublisherPort,
} from '@/ports';
import { AuthAttemptId, AuthenticationAttempt } from '@/domain';

import { AuthenticationMethodResolver } from '../authentication-method-resolver';

type InputProps = {
  attemptId: AuthAttemptId;
  payload: unknown;
};

type Output = Result<void, AuthenticationAttemptNotFound>;

export class VerifyAuthenticationFlowApplicationService implements ApplicationServicePort<
  InputProps,
  Output
> {
  constructor(
    private readonly attempts: AuthenticationAttemptRepositoryPort,
    private readonly methods: AuthenticationMethodResolver,
    private readonly events: DomainEventPublisherPort,
  ) {}

  async execute({ attemptId, payload }: InputProps): Promise<Output> {
    const attempt = await this.attempts.findById(attemptId);

    if (!attempt) {
      return Result.fail(
        new AuthenticationAttemptNotFound({ attemptId: attemptId.value }),
      );
    }

    const method = this.methods.resolve(attempt.methodValue);

    const outcome = method.verify({ authAttemptId: attempt.id, payload });

    if (!outcome.ok) {
      attempt.fail(outcome.violation.toString());
    } else {
      attempt.succeed();
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
