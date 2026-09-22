import type { FeatureObjective } from './feature-objective';
import type { FeatureValue } from './feature-value';

/**
 * Defines a measurable characteristic extracted from a candidate.
 *
 * Features must be deterministic and side-effect free.
 *
 * @typeParam Candidate - Domain-specific candidate type.
 * @typeParam Context - Runtime facts available during evaluation.
 * @typeParam Policy - Business policy configuration.
 */
export interface Feature<Candidate, Context, Policy> {
  /**
   * Stable identifier of this feature.
   *
   * Used for:
   * - audit records
   * - debugging
   * - feature lookup
   * - scoring configuration
   *
   * Example:
   * "delivery-time"
   */
  readonly key: string;

  /**
   * Defines whether higher or lower values are preferred.
   *
   * Used by normalization strategies.
   */
  readonly objective: FeatureObjective;

  /**
   * Calculates the raw feature value for a candidate.
   *
   * The implementation must:
   * - not mutate candidate/context/policy
   * - not perform external I/O
   * - return deterministic output
   *
   * @param candidate Candidate being evaluated.
   * @param context Runtime decision context.
   * @param policy Active decision policy.
   *
   * @returns Numeric feature measurement.
   */
  evaluate: (
    candidate: Candidate,
    context: Context,
    policy: Policy,
  ) => FeatureValue;
}
