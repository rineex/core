/**
 * Represents a calculated value produced by a feature evaluation.
 *
 * A feature value contains the raw measurement.
 * Normalization and scoring should not modify this object.
 */
export interface FeatureValue {
  /**
   * Stable identifier of the feature that produced this value.
   *
   * Example:
   * "delivery-time"
   */
  readonly key: string;

  /**
   * Raw numeric value produced by the feature.
   *
   * This value represents the original measurement before
   * normalization or scoring.
   *
   * Examples:
   * 5 days
   * 120 km
   * 0.92 reliability score
   */
  readonly rawValue: number;

  /**
   * Optional normalized value.
   *
   * This should only be populated by a normalization step.
   *
   * Typical range:
   * 0..1
   */
  readonly normalizedValue?: number;
}
