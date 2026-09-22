/**
 * Resolves the weight assigned to a feature for the active policy.
 *
 * @typeParam Policy - Domain-specific policy type.
 */
export interface FeatureWeightResolver<Policy> {
  /**
   * Resolves the weight for a feature.
   *
   * @param featureKey - Stable feature identifier.
   * @param policy - Active decision policy.
   * @returns Finite non-negative weight.
   */
  resolve: (featureKey: string, policy: Policy) => number;
}
