/**
 * Represents configurable business rules and preferences
 * used during a decision execution.
 *
 * Policies must be versioned when changes affect decision outcomes,
 * allowing historical decisions to be reproduced.
 */
export interface DecisionPolicy {
  /**
   * Stable identifier of the policy.
   *
   * Example:
   * "supplier-selection"
   */
  readonly id: string;

  /**
   * Version of the policy configuration.
   *
   * Example:
   * "v3"
   */
  readonly version: string;

  /**
   * Policy-specific configuration.
   *
   * The decision framework does not interpret this data.
   * Individual constraints, features, and strategies consume it.
   */
  readonly values: Readonly<Record<string, unknown>>;
}
