import type { FeatureValue } from '../feature/feature-value.js';
import type { FeatureWeightResolver } from './feature-weight-resolver.js';
import type { ScoringStrategy } from './scoring-strategy.js';

/**
 * Calculates candidate scores as the weighted sum of normalized
 * feature values.
 *
 * Higher resulting scores represent more desirable candidates.
 *
 * @typeParam Policy - Domain-specific policy type.
 */
export class WeightedSumScoringStrategy<
  Policy,
> implements ScoringStrategy<Policy> {
  /**
   * Stable identifier of this scoring strategy.
   */
  public readonly id = 'weighted-sum';

  /**
   * Resolves feature weights from the active policy.
   */
  private readonly weightResolver: FeatureWeightResolver<Policy>;

  /**
   * Creates a weighted-sum scoring strategy.
   *
   * @param weightResolver - Resolver responsible for retrieving the
   * weight associated with each feature.
   */
  public constructor(weightResolver: FeatureWeightResolver<Policy>);

  /**
   * Calculates the weighted sum of normalized feature values.
   *
   * @param features - Normalized feature values of one eligible candidate.
   * @param policy - Active decision policy.
   *
   * @returns Finite numeric candidate score.
   *
   * @throws DecisionExecutionError when normalized values or weights
   * are invalid.
   */
  public score(features: readonly FeatureValue[], policy: Policy): number;
}
