/**
 * Represents all runtime inputs required to execute a decision.
 *
 * The request is immutable and must not contain infrastructure dependencies.
 *
 * @typeParam Candidate - Domain-specific candidate type being evaluated.
 * @typeParam Context - Runtime facts used during evaluation.
 * @typeParam Policy - Business policy configuration used by constraints and strategies.
 */
export interface DecisionRequest<Candidate, Context, Policy> {
  /**
   * Candidates available for evaluation.
   *
   * The engine must treat this collection as immutable.
   */
  readonly candidates: readonly Candidate[];

  /**
   * Runtime facts available during this decision execution.
   *
   * Examples:
   * current time,
   * requested quantity,
   * destination,
   * operational state.
   */
  readonly context: Context;

  /**
   * Business policy configuration applied to this decision.
   */
  readonly policy: Policy;

  /**
   * Optional identifier used to correlate this decision with
   * an external request, workflow, trace, command, or transaction.
   *
   * The decision engine must not generate this value implicitly.
   */
  readonly correlationId?: string;
}
