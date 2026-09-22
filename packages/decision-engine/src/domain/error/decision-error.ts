/**
 * Base error for failures produced by the decision engine or its components.
 *
 * Decision errors represent invalid configuration, invalid execution input,
 * or failures while evaluating decision components.
 */
export abstract class DecisionError extends Error {
  /**
   * Stable machine-readable error code.
   *
   * Consumers should prefer this value over matching error messages.
   */
  public abstract readonly code: string;

  /**
   * Optional structured diagnostic metadata.
   *
   * Metadata should contain serializable values only and must not contain
   * services, functions, or mutable infrastructure objects.
   */
  public readonly details?: Readonly<Record<string, unknown>>;

  /**
   * Creates a decision error.
   *
   * @param message - Human-readable diagnostic message.
   * @param details - Optional structured metadata describing the failure.
   * @param cause - Optional original error that caused this failure.
   */
  protected constructor(
    message: string,
    details?: Readonly<Record<string, unknown>>,
    cause?: unknown,
  );
}
