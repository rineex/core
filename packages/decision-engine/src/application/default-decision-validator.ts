import type { DecisionDefinition } from '@/domain/event/decision-completed-event';
import type { DecisionRequest } from '@/domain/model/decision-request';

import type { DecisionValidator } from './decision-validator';

/**
 * Default validator for decision definitions and execution requests.
 *
 * Performs framework-level validation only.
 * Domain-specific validation remains the responsibility of policies,
 * constraints, features, and strategies.
 */
export class DefaultDecisionValidator implements DecisionValidator {
  /**
   * Validates the reusable decision definition.
   */
  public validateDefinition<Candidate, Context, Policy>(
    definition: DecisionDefinition<Candidate, Context, Policy>,
  ): void;

  /**
   * Validates runtime decision input.
   */
  public validateRequest<Candidate, Context, Policy>(
    request: DecisionRequest<Candidate, Context, Policy>,
  ): void;
}
