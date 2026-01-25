import { ApplicationServicePort, Result } from '@rineex/ddd';

import { ObservabilityEventPort } from '@/ports/observability/observability-event.port';
import { MfaSessionIdGenerator } from '@/ports/mfa/mfa-session-id-generator.port';
import { MfaSessionRepository } from '@/ports/mfa/mfa-session-repository.port';
import { MFASession } from '@/domain/mfa/aggregates/mfa-session.aggregate';
import { LoggerPort } from '@/ports/log/log.port';
import { IdentityId } from '@/index';

import { VerificationFailedObservabilityEvent } from './events/verification-failed-observability.event';
import { SessionStartedObservabilityEvent } from './events/session-started-observability.event';

type StartMFASessionInput = {
  identityId: IdentityId;
  maxAttempts: number;
};

type StartMFASessionOutput = Result<MFASession, never>;

export class StartMfaSessionApplicationService implements ApplicationServicePort<
  StartMFASessionInput,
  StartMFASessionOutput
> {
  constructor(
    private readonly repository: MfaSessionRepository,
    private readonly idGenerator: MfaSessionIdGenerator,
    private readonly logger: LoggerPort,
    private readonly events: ObservabilityEventPort,
  ) {}

  async execute(args: StartMFASessionInput): Promise<StartMFASessionOutput> {
    try {
      const existing = await this.repository.findActiveByIdentity(
        args.identityId,
      );

      if (existing) {
        this.logger.info('MFA session reused', {
          identityId: args.identityId.toString(),
        });

        this.events.emit(
          new SessionStartedObservabilityEvent({
            identityId: args.identityId.toString(),
            sessionId: existing.id.toString(),
            reused: true,
          }),
        );

        return Result.ok(existing);
      }

      const session = new MFASession({
        id: this.idGenerator.generate(),
        maxAttempts: args.maxAttempts,
        identityId: args.identityId,
        attemptsUsed: 0,
        challenges: [],
      });

      await this.repository.save(session);

      this.logger.info('MFA session started', {
        identityId: args.identityId.toString(),
        sessionId: session.id.toString(),
      });

      this.events.emit(
        new SessionStartedObservabilityEvent({
          identityId: args.identityId.toString(),
          sessionId: session.id.toString(),
          reused: false,
        }),
      );

      return Result.ok(session);
    } catch (violation) {
      this.events.emit(
        new VerificationFailedObservabilityEvent(
          args.identityId.toString(),
          violation instanceof Error
            ? violation.message
            : 'START_MFA_SESSION_ERROR',
        ),
      );

      this.logger.error('Error starting MFA session', { violation, ...args });
      return Result.fail(violation as never);
    }
  }
}
