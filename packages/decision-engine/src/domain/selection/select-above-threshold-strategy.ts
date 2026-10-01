import type { CandidateEvaluation } from '../model/candidate-evaluation.js';
import type { SelectionStrategy } from './selection-strategy.js';

import { DecisionExecutionError } from '../error/decision-execution-error.js';
import { InvalidDecisionDefinitionError } from '../error/invalid-decision-definition-error.js';
import { validateRankedEvaluations } from './validate-ranked-evaluations.js';

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
  public constructor(threshold: number) {
    if (!Number.isFinite(threshold)) {
      throw new InvalidDecisionDefinitionError(
        'Selection threshold must be finite.',
        { threshold },
      );
    }
    this.threshold = threshold;
  }

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
    _context: Context,
    _policy: Policy,
  ): readonly CandidateEvaluation<Candidate>[] {
    validateRankedEvaluations(evaluations);
    return evaluations.filter(evaluation => {
      const score = evaluation.score;
      if (typeof score !== 'number' || !Number.isFinite(score)) {
        throw new DecisionExecutionError(
          'Threshold selection requires finite candidate scores.',
        );
      }
      return score >= this.threshold;
    });
  }
}
