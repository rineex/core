import { AuthPolicyDecision } from '../contracts/auth-policy-decision';
import { AuthPolicyContext } from '../contracts/auth-policy-context';
import { AuthPolicyEvaluator } from '../contracts/auth-policy';

/**
 * Coordinates multiple authentication policies
 * and produces a final decision.
 */
export class AuthPolicyEngine {
  private readonly policies: readonly AuthPolicyEvaluator[];

  constructor(policies: readonly AuthPolicyEvaluator[]) {
    this.policies = policies;
  }

  /**
   * Evaluates all policies in order.
   * First hard-deny wins.
   */
  public evaluate(context: AuthPolicyContext): AuthPolicyDecision {
    let requiresStepUp = false;

    for (const policy of this.policies) {
      const decision = policy.evaluate(context);
      if (!decision) continue;

      if (decision.allowed === false) {
        return decision;
      }

      if (decision.requiresStepUp) {
        requiresStepUp = true;
      }
    }

    return {
      requiresStepUp,
      allowed: true,
    };
  }
}
