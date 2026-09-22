import type { ConstraintResult } from '../constraint/constraint-result.js';
import type { FeatureValue } from '../feature/feature-value.js';

/**
 * Represents the complete evaluation outcome of a single candidate.
 *
 * The engine creates a new immutable evaluation as the candidate progresses
 * through constraint evaluation, feature extraction, normalization, scoring,
 * ranking, and selection.
 *
 * @typeParam Candidate - Domain-specific candidate type.
 */
export interface CandidateEvaluation<Candidate> {
  /**
   * Original candidate supplied to the decision engine.
   *
   * The candidate must never be mutated by the engine.
   */
  readonly candidate: Candidate;

  /**
   * Results produced by all evaluated constraints.
   *
   * These results provide the explanation for candidate eligibility.
   */
  readonly constraints: readonly ConstraintResult[];

  /**
   * Indicates whether the candidate passed all mandatory constraints.
   *
   * Rejected candidates must not proceed to feature evaluation,
   * normalization, scoring, ranking, or selection.
   */
  readonly eligible: boolean;

  /**
   * Feature measurements calculated for the candidate.
   *
   * Rejected candidates normally contain an empty collection.
   */
  readonly features: readonly FeatureValue[];

  /**
   * Final score produced by the configured scoring strategy.
   *
   * Undefined when the candidate was rejected or scoring has not yet occurred.
   */
  readonly score?: number;

  /**
   * Final one-based ranking position.
   *
   * Undefined when the candidate is ineligible or ranking has not yet occurred.
   */
  readonly rank?: number;

  /**
   * Indicates whether the candidate was selected by the final
   * selection strategy.
   *
   * This must be false for rejected candidates.
   */
  readonly selected: boolean;
}
