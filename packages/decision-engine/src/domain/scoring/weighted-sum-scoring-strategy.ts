import type { FeatureValue } from '../feature/feature-value.js';
import type { FeatureWeightResolver } from './feature-weight-resolver.js';
import type { ScoringStrategy } from './scoring-strategy.js';

import { DecisionExecutionError } from '../error/decision-execution-error.js';
import { InvalidDecisionDefinitionError } from '../error/invalid-decision-definition-error.js';

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
  public constructor(weightResolver: FeatureWeightResolver<Policy>) {
    if (!weightResolver || typeof weightResolver.resolve !== 'function') {
      throw new InvalidDecisionDefinitionError(
        'Feature weight resolver is required.',
      );
    }
    this.weightResolver = weightResolver;
  }

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
  public score(features: readonly FeatureValue[], policy: Policy): number {
    let total = 0;
    for (const feature of features) {
      const normalizedValue = feature.normalizedValue;
      if (
        typeof normalizedValue !== 'number' ||
        !Number.isFinite(normalizedValue)
      ) {
        throw new DecisionExecutionError(
          'Feature normalized value must be finite.',
          {
            featureKey: feature.key,
            normalizedValue: feature.normalizedValue,
          },
        );
      }
      let weight: number;
      try {
        weight = this.weightResolver.resolve(feature.key, policy);
      } catch (error) {
        throw new DecisionExecutionError(
          'Feature weight resolution failed.',
          { featureKey: feature.key },
          error,
        );
      }
      if (!Number.isFinite(weight)) {
        throw new DecisionExecutionError('Feature weight must be finite.', {
          featureKey: feature.key,
          weight,
        });
      }
      total += normalizedValue * weight;
    }
    if (!Number.isFinite(total)) {
      throw new DecisionExecutionError('Weighted score must be finite.', {
        total,
      });
    }
    return total;
  }
}
