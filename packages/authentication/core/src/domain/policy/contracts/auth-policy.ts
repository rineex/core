import { AuthPolicyDecision } from './auth-policy-decision';
import { AuthPolicyContext } from './auth-policy-context';

/**
 * Authentication policy contract.
 * A policy evaluates context and returns a partial decision.
 */
export abstract class AuthPolicyEvaluator {
  /**
   * Evaluates the policy against the given context.
   *
   * Returning `null` means:
   * - this policy is not applicable
   * - it has no opinion
   */
  abstract evaluate(context: AuthPolicyContext): AuthPolicyDecision | null;
}
