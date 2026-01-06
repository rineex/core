import { ObservabilityEvent } from '@/types/observability-event';

export class SessionStartedObservabilityEvent extends ObservabilityEvent {
  constructor(params: {
    sessionId: string;
    identityId: string;
    reused?: boolean;
  }) {
    super({
      payload: {
        reused: params.reused ?? false,
        identityId: params.identityId,
        sessionId: params.sessionId,
      },
      name: 'authentication.mfa.session.started',
    });
  }
}
