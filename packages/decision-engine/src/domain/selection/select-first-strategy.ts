import type { CandidateEvaluation } from '../model/candidate-evaluation.js';
import type { SelectionStrategy } from './selection-strategy.js';

/**
 * Selects the first candidate from the ranked candidate evaluations.
 *
 * This strategy assumes the supplied evaluations are already ordered
 * according to the active ranking strategy.
 *
 * @typeParam Candidate - Domain-specific candidate type.
 * @typeParam Context - Runtime decision context type.
 * @typeParam Policy - Active decision policy type.
 */
export class SelectFirstStrategy<
  Candidate,
  Context,
  Policy,
> implements SelectionStrategy<Candidate, Context, Policy> {
  /**
   * Stable identifier of this selection strategy.
   */
  public readonly id = 'select-first';

  /**
   * Selects the first ranked candidate.
   *
   * @param evaluations - Eligible candidate evaluations in ranking order.
   * @param context - Runtime decision context. Unused by this strategy.
   * @param policy - Active decision policy. Unused by this strategy.
   *
   * @returns Empty collection when no candidates exist, otherwise a
   * single-element collection containing the highest-ranked candidate.
   */
  public select(
    evaluations: readonly CandidateEvaluation<Candidate>[],
    context: Context,
    policy: Policy,
  ): readonly CandidateEvaluation<Candidate>[];
}
