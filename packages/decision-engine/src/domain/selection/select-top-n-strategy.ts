import type { CandidateEvaluation } from '../model/candidate-evaluation.js';
import type { SelectionStrategy } from './selection-strategy.js';

import { InvalidDecisionDefinitionError } from '../error/invalid-decision-definition-error.js';
import { validateRankedEvaluations } from './validate-ranked-evaluations.js';

/**
 * Selects up to a configured number of highest-ranked candidates.
 *
 * @typeParam Candidate - Domain-specific candidate type.
 * @typeParam Context - Runtime decision context type.
 * @typeParam Policy - Active decision policy type.
 */
export class SelectTopNStrategy<
  Candidate,
  Context,
  Policy,
> implements SelectionStrategy<Candidate, Context, Policy> {
  /**
   * Stable identifier of this selection strategy.
   */
  public readonly id = 'select-top-n';

  /**
   * Maximum number of candidates to select.
   */
  private readonly limit: number;

  /**
   * Creates a top-N selection strategy.
   *
   * @param limit - Maximum number of ranked candidates to select.
   *
   * @throws InvalidDecisionDefinitionError when the limit is not a
   * positive integer.
   */
  public constructor(limit: number) {
    if (!Number.isSafeInteger(limit) || limit <= 0) {
      throw new InvalidDecisionDefinitionError(
        'Selection limit must be a positive integer.',
        { limit },
      );
    }
    this.limit = limit;
  }

  /**
   * Selects up to the configured number of highest-ranked candidates.
   *
   * @param evaluations - Eligible candidate evaluations in ranking order.
   * @param context - Runtime decision context. Unused by this strategy.
   * @param policy - Active decision policy. Unused by this strategy.
   *
   * @returns A ranked subset containing at most `limit` candidates.
   */
  public select(
    evaluations: readonly CandidateEvaluation<Candidate>[],
    _context: Context,
    _policy: Policy,
  ): readonly CandidateEvaluation<Candidate>[] {
    validateRankedEvaluations(evaluations);
    return evaluations.slice(0, this.limit);
  }
}
