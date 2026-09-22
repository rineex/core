import { DecisionError } from './decision-error.js';

/**
 * Raised when a decision execution fails after validation has succeeded.
 */
export class DecisionExecutionError extends DecisionError {
  /**
   * Stable machine-readable error code.
   */
  public readonly code = 'DECISION_EXECUTION_FAILED';

  /**
   * Creates a decision execution error.
   *
   * @param message - Human-readable description of the execution failure.
   * @param details - Structured metadata identifying the failed execution stage.
   * @param cause - Original underlying error.
   */
  public constructor(
    message: string,
    details?: Readonly<Record<string, unknown>>,
    cause?: unknown,
  );
}
