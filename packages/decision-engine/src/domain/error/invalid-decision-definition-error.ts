import { DecisionError } from './decision-error.js';

/**
 * Raised when a decision definition violates required structural
 * or configuration invariants.
 */
export class InvalidDecisionDefinitionError extends DecisionError {
  /**
   * Stable machine-readable error code.
   */
  public readonly code = 'DECISION_DEFINITION_INVALID';

  /**
   * Creates an invalid decision definition error.
   *
   * @param message - Human-readable description of the validation failure.
   * @param details - Structured metadata identifying the invalid definition.
   * @param cause - Optional underlying error.
   */
  public constructor(
    message: string,
    details?: Readonly<Record<string, unknown>>,
    cause?: unknown,
  );
}
