import type { ConstraintResult } from './constraint-result.js';

/**
 * Defines a mandatory eligibility rule for a decision candidate.
 *
 * Constraints are expected to be deterministic and side-effect free.
 *
 * @typeParam Candidate - Domain-specific candidate being evaluated.
 * @typeParam Context - Runtime facts available during evaluation.
 * @typeParam Policy - Business policy configuration used by the rule.
 */
export interface Constraint<Candidate, Context, Policy> {
  /**
   * Stable identifier of the constraint.
   *
   * Used for diagnostics, audit records, and explainability.
   *
   * Example:
   * "minimum-quality"
   */
  readonly id: string;

  /**
   * Evaluates whether the candidate satisfies this constraint.
   *
   * Implementations must not mutate the candidate, context, or policy.
   *
   * @param candidate - Candidate currently being evaluated.
   * @param context - Runtime facts for the current decision execution.
   * @param policy - Active business policy.
   * @returns Structured eligibility result.
   */
  evaluate: (
    candidate: Candidate,
    context: Context,
    policy: Policy,
  ) => ConstraintResult;
}
