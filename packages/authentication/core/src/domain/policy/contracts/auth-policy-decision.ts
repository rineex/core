/**
 * Final decision produced by the policy engine.
 * This object is immutable and side-effect free.
 */
export type AuthPolicyDecision =
  | { readonly allowed: false; readonly reason: string }
  | { readonly allowed: true; readonly requiresStepUp: boolean };
