import type { CandidateEvaluation } from '../model/candidate-evaluation.js';
import type { Normalizer } from './normalizer.js';

import { DecisionExecutionError } from '../error/decision-execution-error.js';

/**
 * Normalizes feature values into the range [0, 1] using min-max normalization.
 *
 * Feature objectives are respected so that higher normalized values
 * always represent more desirable outcomes.
 */
export class MinMaxNormalizer<Candidate> implements Normalizer<Candidate> {
  /**
   * Stable identifier of this normalization strategy.
   */
  public readonly id = 'min-max';

  /**
   * Normalizes raw feature values across all eligible candidates.
   *
   * @param evaluations - Eligible candidate evaluations containing
   * raw feature values.
   *
   * @returns New immutable evaluations with normalized feature values.
   *
   * @throws DecisionExecutionError when feature values are invalid,
   * inconsistent, or cannot be normalized safely.
   */
  public normalize(
    evaluations: readonly CandidateEvaluation<Candidate>[],
  ): readonly CandidateEvaluation<Candidate>[] {
    if (evaluations.length === 0) {
      return [];
    }

    const expectedFeatures = evaluations[0].features;
    const valuesByKey = new Map<string, number[]>();

    for (const evaluation of evaluations) {
      if (!evaluation.eligible) {
        throw new DecisionExecutionError(
          'Min-max normalization accepts eligible evaluations only.',
        );
      }
      if (evaluation.features.length !== expectedFeatures.length) {
        throw new DecisionExecutionError(
          'Eligible evaluations must expose identical feature sets.',
        );
      }
      evaluation.features.forEach((feature, index) => {
        const expected = expectedFeatures[index];
        if (
          !expected ||
          feature.key !== expected.key ||
          feature.objective !== expected.objective
        ) {
          throw new DecisionExecutionError(
            'Eligible evaluations must expose identically ordered feature keys and objectives.',
          );
        }
        if (!Number.isFinite(feature.rawValue)) {
          throw new DecisionExecutionError(
            'Feature raw values must be finite.',
            { featureKey: feature.key },
          );
        }
        const values = valuesByKey.get(feature.key) ?? [];
        values.push(feature.rawValue);
        valuesByKey.set(feature.key, values);
      });
    }

    return evaluations.map(evaluation => ({
      ...evaluation,
      features: evaluation.features.map(feature => {
        const values = valuesByKey.get(feature.key);
        if (!values) {
          throw new DecisionExecutionError(
            'Feature values are missing during normalization.',
            { featureKey: feature.key },
          );
        }
        const minimum = Math.min(...values);
        const maximum = Math.max(...values);
        const range = maximum - minimum;
        const normalizedValue =
          range === 0
            ? 1
            : feature.objective === 'maximize'
              ? (feature.rawValue - minimum) / range
              : (maximum - feature.rawValue) / range;
        return { ...feature, normalizedValue };
      }),
    }));
  }
}
