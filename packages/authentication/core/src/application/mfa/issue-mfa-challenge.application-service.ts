import { ApplicationServicePort, Result } from '@rineex/ddd';

import { ObservabilityEventPort } from '@/ports/observability/observability-event.port';
import { MfaSessionRepository } from '@/ports/mfa/mfa-session-repository.port';
import { MfaSessionId } from '@/domain/mfa/value-objects/mfa-session-id.vo';
import { MFAChallenge } from '@/domain/mfa/entities/mfa-challenge.entity';
import { MfaClock } from '@/ports/mfa/mfa-clock.port';
import { LoggerPort } from '@/ports/log/log.port';

import { ChallengeIssueObservabilityEvent } from './events/challenge-issue-observability.event';

type IssueMfaChallengeInput = {
  sessionId: MfaSessionId;
  challenge: MFAChallenge;
};

type IssueMfaChallengeOutput = Result<void, never>;

export class IssueMfaChallengeApplicationService implements ApplicationServicePort<
  IssueMfaChallengeInput,
  IssueMfaChallengeOutput
> {
  constructor(
    private readonly repository: MfaSessionRepository,
    private readonly clock: MfaClock,
    private readonly logger: LoggerPort,
    private readonly events: ObservabilityEventPort,
  ) {}

  async execute({
    challenge,
    sessionId,
  }: IssueMfaChallengeInput): Promise<IssueMfaChallengeOutput> {
    try {
      const session = await this.repository.findById(sessionId);

      if (!session) {
        this.logger.warn('MFA session not found', { sessionId });
        throw new Error('MFA session not found'); // app-layer error
      }

      session.issueChallenge(challenge, this.clock.now());

      await this.repository.save(session);

      this.logger.info('MFA challenge issued', {
        sessionId: sessionId.toString(),
        challengeType: challenge,
      });

      this.events.emit(
        new ChallengeIssueObservabilityEvent({
          challengeType: challenge.challengeType,
          sessionId: sessionId.toString(),
          success: true,
        }),
      );

      return Result.ok(undefined);
    } catch (error) {
      this.events.emit(
        new ChallengeIssueObservabilityEvent({
          challengeType: challenge.challengeType,
          sessionId: sessionId.toString(),
          success: false,
        }),
      );

      this.logger.error('Error issuing MFA challenge', {
        sessionId: sessionId.toString(),
        error,
      });
      return Result.fail(error as never);
    }
  }
}
