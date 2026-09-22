import type { ConstraintResult } from '../constraint/constraint-result.js';
import type { DecisionEvent } from '../model/decision-event.js';

/**
 * Payload emitted when a candidate is rejected during constraint evaluation.
 */
export interface CandidateRejectedEventPayload {
  /**
   * Stable external or domain-level reference for the rejected candidate.
   *
   * The decision framework does not define how candidate identity is represented.
   */
  readonly candidateRef: string;

  /**
   * Constraint results responsible for the rejection.
   *
   * Normally this collection contains only failed constraints.
   */
  readonly failedConstraints: readonly ConstraintResult[];
}

/**
 * Domain event representing a candidate rejection.
 */
export interface CandidateRejectedEvent extends DecisionEvent<CandidateRejectedEventPayload> {
  /**
   * Stable event type used by subscribers and serializers.
   */
  readonly type: 'candidate.rejected';
}
