import type { CandidateEvaluation } from '../model/candidate-evaluation';
import type { RankingStrategy } from '../ranking/ranking-strategy';

/**
 * Ranks eligible candidate evaluations by score in descending order.
 *
 * Candidates with equal scores preserve their original input order,
 * providing deterministic and stable tie-breaking.
 *
 * @typeParam Candidate - Domain-specific candidate type.
 * @typeParam Context - Runtime decision context type.
 * @typeParam Policy - Active decision policy type.
 */
export class DescendingScoreRankingStrategy<
  Candidate,
  Context,
  Policy,
> implements RankingStrategy<Candidate, Context, Policy> {
  /**
   * Stable identifier of this ranking strategy.
   */
  public readonly id = 'score-descending';

  /**
   * Orders candidate evaluations from highest score to lowest score.
   *
   * @param evaluations - Eligible candidate evaluations with valid scores.
   * @param context - Runtime decision context. Unused by this strategy.
   * @param policy - Active decision policy. Unused by this strategy.
   *
   * @returns New immutable collection ordered by descending score.
   *
   * @throws DecisionExecutionError when an evaluation is ineligible,
   * has no score, or contains a non-finite score.
   */
  public rank(
    evaluations: readonly CandidateEvaluation<Candidate>[],
    context: Context,
    policy: Policy,
  ): readonly CandidateEvaluation<Candidate>[];
}
