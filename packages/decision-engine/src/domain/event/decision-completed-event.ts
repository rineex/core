import type { CandidateRefResolver } from '../candidate/candidate-ref-resolver.js';
import type { Constraint } from '../constraint/constraint.js';
import type { Feature } from '../feature/feature.js';
import type { Normalizer } from '../normalization/normalizer.js';
import type { RankingStrategy } from '../ranking/ranking-strategy.js';
import type { ScoringStrategy } from '../scoring/scoring-strategy.js';
import type { SelectionStrategy } from '../selection/selection-strategy.js';

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
   */
  readonly id: string;

  /**
   * Behavioral version of the decision definition.
   */
  readonly version: string;

  /**
   * Resolves a stable reference for each candidate.
   *
   * Used for events, diagnostics, audit records, and explainability.
   */
  readonly candidateRefResolver: CandidateRefResolver<Candidate>;

  /**
   * Hard eligibility rules applied to every candidate.
   */
  readonly constraints: readonly Constraint<Candidate, Context, Policy>[];

  /**
   * Features extracted from eligible candidates.
   */
  readonly features: readonly Feature<Candidate, Context, Policy>[];

  /**
   * Feature normalization strategy.
   */
  readonly normalizer: Normalizer<Candidate>;

  /**
   * Candidate scoring strategy.
   */
  readonly scoringStrategy: ScoringStrategy<Policy>;

  /**
   * Candidate ranking strategy.
   */
  readonly rankingStrategy: RankingStrategy<Candidate, Context, Policy>;

  /**
   * Final selection strategy.
   */
  readonly selectionStrategy: SelectionStrategy<Candidate, Context, Policy>;
}
