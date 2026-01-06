import { ObservabilityEvent } from '@/types/observability-event';

export class VerificationFailedObservabilityEvent extends ObservabilityEvent {
  constructor(sessionId: string, reasonCode: string) {
    super({
      payload: {
        reasonCode,
        sessionId,
      },
      name: 'authentication.mfa.verification_failed',
      occurredAt: new Date(),
    });
  }
}
