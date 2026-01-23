import { ObservabilityEvent } from '@/types/observability-event';

export class ChallengeIssueObservabilityEvent extends ObservabilityEvent {
  constructor(params: {
    sessionId: string;
    challengeType: string;
    success?: boolean;
  }) {
    super({
      payload: {
        challengeType: params.challengeType,
        sessionId: params.sessionId,
        success: params.success,
      },
      name: 'authentication.mfa.challenge.issued',
    });
  }
}
