import type { CandidateEvaluation } from '../model/candidate-evaluation.js';
import type { Normalizer } from './normalizer.js';

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
  ): readonly CandidateEvaluation<Candidate>[];
}
