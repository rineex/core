import type { FeatureValue } from '../feature/feature-value.js';

/**
 * Calculates the final numeric score for an eligible candidate.
 *
 * Implementations must be deterministic, side-effect free, and must not
 * mutate the supplied feature values or policy.
 *
 * @typeParam Policy - Business policy type used by the scoring strategy.
 */
export interface ScoringStrategy<Policy> {
  /**
   * Stable identifier of the scoring strategy.
   *
   * Used for diagnostics, auditing, and reproducibility.
   *
   * Example:
   * "weighted-sum"
   */
  readonly id: string;

  /**
   * Calculates the candidate score from normalized feature values.
   *
   * @param features - Feature values for one eligible candidate.
   * Normalized values are expected to be available when required by
   * the implementation.
   *
   * @param policy - Active decision policy.
   *
   * @returns Finite numeric score used by the ranking strategy.
   *
   * @throws An implementation-specific error when required feature values,
   * policy configuration, or normalized values are invalid.
   */
  score: (features: readonly FeatureValue[], policy: Policy) => number;
}
