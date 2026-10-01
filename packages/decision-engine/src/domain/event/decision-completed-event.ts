import type { DecisionEvent } from '../model/decision-event.js';

/**
 * Payload emitted once a decision execution has completed.
 */
export interface DecisionCompletedEventPayload {
  readonly candidateCount: number;
  readonly eligibleCount: number;
  readonly rejectedCount: number;
  readonly selectedCandidateRefs: readonly string[];
}

/** Domain event representing completion of one decision execution. */
export interface DecisionCompletedEvent extends DecisionEvent<DecisionCompletedEventPayload> {
  readonly type: 'decision.completed';
}
