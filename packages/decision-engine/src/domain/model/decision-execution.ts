import type { DecisionResult } from '../../domain/model/decision-result.js';
import type { DecisionEvent } from './decision-event.js';

/**
 * Represents the complete output of a decision engine execution.
 *
 * It contains the final business result together with domain events that
 * describe relevant facts produced during the execution.
 *
 * @typeParam Candidate - Domain-specific candidate type.
 */
export interface DecisionExecution<Candidate> {
  /**
   * Final immutable decision outcome.
   */
  readonly result: DecisionResult<Candidate>;

  /**
   * Domain events produced during the execution.
   *
   * The decision engine only creates these events.
   * Publishing is handled separately by the application layer.
   */
  readonly events: readonly DecisionEvent[];
}
