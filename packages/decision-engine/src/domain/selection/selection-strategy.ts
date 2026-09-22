import type { CandidateEvaluation } from '../model/candidate-evaluation.js';

/**
 * Defines how ranked candidate evaluations are selected as final outcomes.
 *
 * Implementations must be deterministic and side-effect free.
 *
 * @typeParam Candidate - Domain-specific candidate type.
 * @typeParam Context - Runtime decision context.
 * @typeParam Policy - Active decision policy.
 */
export interface SelectionStrategy<Candidate, Context, Policy> {
  /**
   * Stable identifier of the selection strategy.
   *
   * Example:
   * "select-first"
   */
  readonly id: string;

  /**
   * Selects zero, one, or multiple candidates from the ranked evaluations.
   *
   * Implementations must not mutate the supplied collection or evaluations.
   *
   * @param evaluations - Eligible candidate evaluations in ranking order.
   * @param context - Runtime decision context.
   * @param policy - Active decision policy.
   * @returns A subset of the supplied evaluations representing the selection.
   */
  select: (
    evaluations: readonly CandidateEvaluation<Candidate>[],
    context: Context,
    policy: Policy,
  ) => readonly CandidateEvaluation<Candidate>[];
}
