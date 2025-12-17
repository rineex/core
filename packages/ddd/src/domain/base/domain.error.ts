export interface DomainErrorMetadata {
  cause?: { name: string; message: string; stack?: string };
  [key: string]: unknown;
}

const getCauseInfo = (cause: Error | undefined) => {
  // 1. Handle Error objects specifically
  if (cause instanceof Error) {
    return {
      cause: {
        message: cause.message,
        stack: cause.stack,
        name: cause.name,
      },
    };
  }

  // 2. Handle other existing values
  if (cause) {
    return { cause };
  }

  // 3. Default to empty
  return {};
};

/**
 * Base class for all Domain Errors in the application.
 *
 * This class ensures:
 * 1. Serializable and structured for logs or API responses.
 * 2. Identifiable via stable error codes (not just class names).
 * 3. Contextual with optional structured metadata.
 * 4. Supports error chaining (cause) and stack trace preservation.
 *
 * @example
 * export class InsufficientFundsError extends DomainError {
 *   constructor(accountId: string, currentBalance: number) {
 *     super(
 *       `Account ${accountId} has insufficient funds.`,
 *       'INSUFFICIENT_FUNDS',
 *       { accountId, currentBalance }
 *     );
 *   }
 * }
 */
export abstract class DomainError extends Error {
  /** Stable, machine-readable error code */
  public readonly code: string;
  /** Structured, immutable domain metadata */
  public readonly metadata: Readonly<DomainErrorMetadata>;

  /**
   * @param message - Human-readable error message
   * @param code - Stable error code
   * @param metadata - Domain-specific structured data; optional `cause` can be included
   */
  protected constructor(
    message: string,
    code: string,
    metadata: DomainErrorMetadata = {},
  ) {
    super(message, { ...getCauseInfo(metadata.cause) });

    // Restore prototype chain for proper `instanceof` checks
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = new.target.name;
    this.code = code;
    this.metadata = Object.freeze({ ...metadata });
  }
}
