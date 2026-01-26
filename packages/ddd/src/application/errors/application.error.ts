interface ErrorParams {
  message: string;
  code: string;
  metadata?: Record<string, unknown>;
  isOperational?: boolean;
  cause?: Error;
}

/**
 * Abstract base class for application-level errors with structured error handling.
 *
 * Extends the native Error class to provide machine-readable error codes, HTTP status codes,
 * operational error classification, and optional metadata for better error tracking and client communication.
 *
 * @abstract
 * @extends {Error}
 *
 * @example
 * ```typescript
 * class UserNotFoundError extends ApplicationError {
 *   constructor(userId: string) {
 *     super({
 *       code: HttpStatusMessage['404'],
 *       isOperational: true,
 *       message: `User with id ${userId} not found`,
 *       metadata: { userId }
 *     });
 *   }
 * }
 * ```
 */
export abstract class ApplicationError extends Error {
  /** Optional cause (linked error) */
  public readonly cause?: Error | undefined;
  /** Machine-readable error code (e.g. `OTP_LOCKED`, `USER_NOT_FOUND`) */
  public readonly code: string;
  /** Operational vs programmer error flag */
  public readonly isOperational: boolean;
  /** Optional structured metadata for debugging or clients */
  public readonly metadata?: Record<string, unknown> | undefined;

  constructor({
    isOperational = false,
    metadata,
    message,
    cause,
    code,
  }: ErrorParams) {
    super(message);

    this.name = new.target.name;
    this.code = code;
    this.isOperational = isOperational;
    this.metadata = metadata;
    this.cause = cause;

    Error.captureStackTrace(this, new.target);
  }
}
