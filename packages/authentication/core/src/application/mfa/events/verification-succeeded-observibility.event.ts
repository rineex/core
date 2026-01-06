import { ObservabilityEvent } from '@/types/observability-event';

export class VerificationSucceededObservabilityEvent extends ObservabilityEvent {
  constructor(params: { sessionId: string }) {
    super({
      payload: {
        sessionId: params.sessionId,
      },
      name: 'authentication.mfa.verification.succeeded',
    });
  }
}
