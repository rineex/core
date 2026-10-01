import type { DecisionDefinition } from '../domain/model/decision-definition.js';
import type { DecisionRequest } from '../domain/model/decision-request.js';

/**
 * Validates decision definitions and execution requests before the
 * decision pipeline begins.
 *
 * Validation must be deterministic and side-effect free.
 */
export interface DecisionValidator {
  /**
   * Validates a decision definition.
   *
   * @throws InvalidDecisionDefinitionError when the definition violates
   * required structural invariants.
   */
  validateDefinition: <Candidate, Context, Policy>(
    definition: DecisionDefinition<Candidate, Context, Policy>,
  ) => void;

  /**
   * Validates a decision execution request.
   *
   * @throws DecisionExecutionError when the request cannot be executed safely.
   */
  validateRequest: <Candidate, Context, Policy>(
    request: DecisionRequest<Candidate, Context, Policy>,
  ) => void;
}
