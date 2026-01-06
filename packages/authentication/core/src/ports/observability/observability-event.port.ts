import { ObservabilityEvent } from '@/types/observability-event';

/**
 * Observability event emitter.
 *
 * Used for:
 * - audit logs
 * - security monitoring
 * - metrics
 * - tracing
 *
 * Must be non-blocking and non-throwing.
 */
export type ObservabilityEventPort = {
  emit: (event: ObservabilityEvent) => void;
};
