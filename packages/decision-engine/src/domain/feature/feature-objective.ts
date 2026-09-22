/**
 * Defines whether a feature should be optimized upward or downward.
 *
 * This information is used by normalization strategies to convert
 * raw feature values into comparable scores.
 */
export const FeatureObjective = {
  /**
   * Higher values represent better outcomes.
   *
   * Examples:
   * - quality
   * - reliability
   * - performance
   */
  MAXIMIZE: 'maximize',
  /**
   * Lower values represent better outcomes.
   *
   * Examples:
   * - cost
   * - latency
   * - delivery time
   */
  MINIMIZE: 'minimize',
} as const;

export type FeatureObjective =
  (typeof FeatureObjective)[keyof typeof FeatureObjective];
