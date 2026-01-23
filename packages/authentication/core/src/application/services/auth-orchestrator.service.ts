import { AuthenticationAttemptRepositoryPort } from '@/ports/outbound/authentication-attempt.repository.port';
import { DomainEventPublisherPort } from '@/ports/outbound/domain-event-publisher.port';
import { StartAuthenticationCommand } from '@/ports/inbound/start-auth.command';
import { AuthAttemptId, AuthenticationAttempt, AuthMethod } from '@/domain';
import { AuthMethodPort } from '@/ports/inbound/auth-method.port';
import { AuthMethodName } from '@/types/auth-method.type';
import { ApplicationServicePort } from '@rineex/ddd';

/**
 * Application service responsible for orchestrating authentication flows.
 *
 * This service:
 * - Coordinates domain objects
 * - Delegates authentication to method modules
 * - Remains stateless and deterministic
 *
 * It is safe to use in:
 * - HTTP servers
 * - Workers
 * - Serverless
 * - CLI tools
 */
export class AuthOrchestratorService implements ApplicationServicePort<
  StartAuthenticationCommand,
  AuthAttemptId
> {
  constructor(
    private readonly authMethods: readonly AuthMethodPort[],
    private readonly attemptRepository: AuthenticationAttemptRepositoryPort,
    private readonly eventPublisher: DomainEventPublisherPort,
    private readonly idGenerator: () => AuthAttemptId,
  ) {}

  /**
   * Starts a new authentication flow.
   *
   * @throws Error if method is not registered
   */
  async execute({
    identityId,
    context,
    method,
  }: StartAuthenticationCommand): Promise<AuthAttemptId> {
    const authMethod = this.resolveAuthMethod(method);

    const attemptId = this.idGenerator();

    const attempt = AuthenticationAttempt.start(
      attemptId,
      AuthMethod.create(method),
      identityId,
    );

    await this.attemptRepository.save(attempt);

    await this.eventPublisher.publish(attempt.pullDomainEvents());

    await authMethod.authenticate(context);

    return attemptId;
  }

  /**
   * Resolves an authentication method implementation.
   *
   * Fail-fast behavior is intentional for security reasons.
   */
  private resolveAuthMethod(method: AuthMethodName): AuthMethodPort {
    const resolved = this.authMethods.find(m => m.method.is(method));

    if (!resolved) {
      throw new Error(`Authentication method not registered: ${method}`);
    }

    return resolved;
  }
}
