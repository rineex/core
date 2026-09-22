import type { CandidateEvaluation } from '../model/candidate-evaluation.js';

/**
 * Defines how scored candidate evaluations are ordered.
 *
 * Implementations must be deterministic and side-effect free.
 *
 * @typeParam Candidate - Domain-specific candidate type.
 * @typeParam Context - Runtime decision context.
 * @typeParam Policy - Active decision policy.
 */
export interface RankingStrategy<Candidate, Context, Policy> {
  /**
   * Stable identifier of the ranking strategy.
   *
   * Example:
   * "score-descending"
   */
  readonly id: string;

  /**
   * Orders eligible, scored candidate evaluations.
   *
   * Implementations must not mutate the supplied collection.
   *
   * @param evaluations - Eligible candidate evaluations with valid scores.
   * @param context - Runtime decision context.
   * @param policy - Active decision policy.
   * @returns Candidate evaluations in deterministic ranking order.
   */
  rank: (
    evaluations: readonly CandidateEvaluation<Candidate>[],
    context: Context,
    policy: Policy,
  ) => readonly CandidateEvaluation<Candidate>[];
}
