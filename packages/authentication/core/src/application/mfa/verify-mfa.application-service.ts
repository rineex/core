import { ApplicationServicePort, Result } from '@rineex/ddd';

import { ObservabilityEventPort } from '@/ports/observability/observability-event.port';
import { MfaSessionRepository } from '@/ports/mfa/mfa-session-repository.port';
import { MfaSessionId } from '@/domain/mfa/value-objects/mfa-session-id.vo';
import { MfaClock } from '@/ports/mfa/mfa-clock.port';
import { LoggerPort } from '@/ports/log/log.port';

import { VerificationSucceededObservabilityEvent } from './events/verification-succeeded-observability.event';
import { VerificationFailedObservabilityEvent } from './events/verification-failed-observability.event';

type VerifyMFAInput = {
  sessionId: MfaSessionId;
};

type VerifyMFAOutput = Result<void, never>;

export class VerifyMfaApplicationService implements ApplicationServicePort<
  VerifyMFAInput,
  VerifyMFAOutput
> {
  constructor(
    private readonly repository: MfaSessionRepository,
    private readonly clock: MfaClock,
    private readonly events: ObservabilityEventPort,

    private readonly logger: LoggerPort,
  ) {}

  async execute({ sessionId }: VerifyMFAInput): Promise<VerifyMFAOutput> {
    try {
      const session = await this.repository.findById(sessionId);

      if (!session) {
        throw new Error('MFA session not found');
      }

      session.markAttempt();
      session.verify(this.clock.now());

      await this.repository.save(session);

      this.events.emit(
        new VerificationSucceededObservabilityEvent({
          sessionId: session.id.toString(),
        }),
      );

      return Result.ok(undefined);
    } catch (error) {
      this.events.emit(
        new VerificationFailedObservabilityEvent(
          sessionId.toString(),

          (error as any).code ?? 'UNKNOWN',
        ),
      );
      this.logger?.error('Error verifying MFA session', { sessionId, error });
      return Result.fail(error as never);
    }
  }
}
