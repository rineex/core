import {
  HttpStatusCode,
  HttpStatusMessage,
} from '@/gateway/constants/http-code';

interface ErrorParams {
  message: string;
  code: HttpStatusMessage;
  status?: HttpStatusCode;
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
 *       status: 404,
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
  public readonly code: HttpStatusMessage;
  /** Operational vs programmer error flag */
  public readonly isOperational: boolean;
  /** Optional structured metadata for debugging or clients */
  public readonly metadata?: Record<string, unknown> | undefined;
  /** HTTP status code intended for response layer */
  public readonly status: HttpStatusCode;

  constructor({
    code = HttpStatusMessage['500'],
    isOperational = false,
    status = 500,
    metadata,
    message,
    cause,
  }: ErrorParams) {
    super(message);

    this.name = new.target.name;
    this.code = code;
    this.status = status;
    this.isOperational = isOperational;
    this.metadata = metadata;
    this.cause = cause;

    Error.captureStackTrace(this, new.target);
  }
}
