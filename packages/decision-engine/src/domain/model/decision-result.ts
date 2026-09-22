import type { CandidateEvaluation } from './candidate-evaluation.js';

/**
 * Represents the final immutable outcome of a decision execution.
 *
 * @typeParam Candidate - Domain-specific candidate type.
 */
export interface DecisionResult<Candidate> {
  /**
   * Stable identifier of the decision definition that produced this result.
   */
  readonly definitionId: string;

  /**
   * Exact version of the decision definition used for execution.
   */
  readonly definitionVersion: string;

  /**
   * Stable identifier of the policy used during execution.
   */
  readonly policyId: string;

  /**
   * Exact policy version used during execution.
   */
  readonly policyVersion: string;

  /**
   * Optional correlation identifier inherited from the request.
   *
   * Used to associate the decision with an external command, request,
   * workflow, trace, or business process.
   */
  readonly correlationId?: string;

  /**
   * Final selected candidate evaluations.
   *
   * The collection may legitimately be empty.
   */
  readonly selected: readonly CandidateEvaluation<Candidate>[];

  /**
   * Complete evaluations for every candidate supplied to the engine.
   *
   * This collection is the canonical explanation of how the final
   * decision was produced.
   */
  readonly evaluations: readonly CandidateEvaluation<Candidate>[];
}
