import type { Constraint } from '../constraint/constraint';
import type { Feature } from '../feature/feature';
import type { Normalizer } from '../normalization/normalizer';
import type { RankingStrategy } from '../ranking/ranking-strategy';
import type { ScoringStrategy } from '../scoring/scoring-strategy';
import type { SelectionStrategy } from '../selection/selection-strategy';

/**
 * Defines the complete configuration required to execute a decision.
 *
 * A decision definition is immutable and reusable across multiple executions.
 *
 * @typeParam Candidate - Domain-specific candidate type.
 * @typeParam Context - Runtime decision context type.
 * @typeParam Policy - Business policy type.
 */
export interface DecisionDefinition<Candidate, Context, Policy> {
  /**
   * Stable identifier of the decision definition.
   *
   * Example:
   * "supplier-selection"
   */
  readonly id: string;

  /**
   * Version of the decision definition.
   *
   * Increment this when changes to constraints, features, or strategies
   * can change decision outcomes.
   *
   * Example:
   * "v2"
   */
  readonly version: string;

  /**
   * Hard eligibility rules applied to every candidate.
   *
   * A candidate must satisfy all configured constraints
   * before feature evaluation and scoring.
   */
  readonly constraints: readonly Constraint<Candidate, Context, Policy>[];

  /**
   * Features extracted from eligible candidates.
   *
   * Feature keys must be unique within this definition.
   */
  readonly features: readonly Feature<Candidate, Context, Policy>[];

  /**
   * Strategy responsible for transforming raw feature values
   * into comparable normalized values.
   */
  readonly normalizer: Normalizer<Candidate>;

  /**
   * Strategy responsible for calculating candidate scores.
   */
  readonly scoringStrategy: ScoringStrategy<Policy>;

  /**
   * Strategy responsible for ordering scored candidates.
   */
  readonly rankingStrategy: RankingStrategy<Candidate, Context, Policy>;

  /**
   * Strategy responsible for choosing the final candidate or candidates.
   */
  readonly selectionStrategy: SelectionStrategy<Candidate, Context, Policy>;
}
