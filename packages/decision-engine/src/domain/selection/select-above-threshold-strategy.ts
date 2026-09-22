import type { CandidateEvaluation } from '../model/candidate-evaluation.js';
import type { SelectionStrategy } from './selection-strategy.js';

/**
 * Selects all ranked candidates whose score is greater than or equal
 * to a configured minimum threshold.
 *
 * @typeParam Candidate - Domain-specific candidate type.
 * @typeParam Context - Runtime decision context type.
 * @typeParam Policy - Active decision policy type.
 */
export class SelectAboveThresholdStrategy<
  Candidate,
  Context,
  Policy,
> implements SelectionStrategy<Candidate, Context, Policy> {
  /**
   * Stable identifier of this selection strategy.
   */
  public readonly id = 'select-above-threshold';

  /**
   * Minimum acceptable candidate score.
   */
  private readonly threshold: number;

  /**
   * Creates a threshold-based selection strategy.
   *
   * @param threshold - Minimum score required for selection.
   *
   * @throws InvalidDecisionDefinitionError when the threshold is not finite.
   */
  public constructor(threshold: number);

  /**
   * Selects ranked candidates whose score is greater than or equal
   * to the configured threshold.
   *
   * @param evaluations - Eligible candidate evaluations in ranking order.
   * @param context - Runtime decision context. Unused by this strategy.
   * @param policy - Active decision policy. Unused by this strategy.
   *
   * @returns Ranked subset satisfying the configured score threshold.
   */
  public select(
    evaluations: readonly CandidateEvaluation<Candidate>[],
    context: Context,
    policy: Policy,
  ): readonly CandidateEvaluation<Candidate>[];
}
