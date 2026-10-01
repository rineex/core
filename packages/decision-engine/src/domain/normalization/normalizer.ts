import type { CandidateEvaluation } from '../model/candidate-evaluation.js';

/**
 * Normalizes raw feature values across eligible candidate evaluations.
 *
 * Implementations must be deterministic and side-effect free.
 *
 * @typeParam Candidate - Domain-specific candidate type.
 */
export interface Normalizer<Candidate> {
  /**
   * Stable identifier of the normalization strategy.
   *
   * Used for diagnostics, auditing, and reproducibility.
   *
   * Example:
   * "min-max"
   */
  readonly id: string;

  /**
   * Normalizes feature values across eligible candidate evaluations.
   *
   * Implementations must not mutate the supplied evaluations,
   * feature values, candidates, or any nested input state.
   *
   * @param evaluations - Eligible candidate evaluations containing raw
   * feature values.
   *
   * @returns New candidate evaluations containing normalized feature values.
   *
   * @throws When feature values are invalid or normalization cannot
   * produce a valid deterministic result.
   */
  normalize: (
    evaluations: readonly CandidateEvaluation<Candidate>[],
  ) => readonly CandidateEvaluation<Candidate>[];
}
