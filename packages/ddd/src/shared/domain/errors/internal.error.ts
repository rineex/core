import {
  DomainError,
  DomainErrorType,
  Metadata,
  Primitive,
} from '../domain.error';

/**
 * Default domain errors for common scenarios.
 * These errors are available across all projects using this module.
 */

/**
 * Error thrown when an unexpected internal error occurs.
 * Typically used for programming bugs, invalid assumptions, or states that should never happen.
 *
 * @remarks
 * - Metadata is optional for empty metadata types and required if a non-empty type is provided.
 * - Useful for debugging, logging, and adding context to unexpected failures.
 *
 * @template T - Type of metadata object (must extend Record<string, Primitive>)
 *
 * @example
 * // Catch a programming error:
 * try {
 *   complexBusinessLogic();
 * } catch (error) {
 *   throw new InternalError(
 *     'Unexpected error in complexBusinessLogic',
 *     { originalError: error.message, timestamp: Date.now() }
 *   );
 * }
 *
 * @example
 * // Fallback for unhandled cases:
 * switch (status) {
 *   case 'PENDING':
 *     break;
 *   case 'COMPLETED':
 *     break;
 *   default:
 *     throw new InternalError(
 *       `Unhandled status: ${status}`,
 *       { status }
 *     );
 * }
 *
 * @example
 * // With custom metadata type:
 * type ErrorMetadata = { userId: string; action: string };
 * throw new InternalError<ErrorMetadata>(
 *   'Failed to process user action',
 *   { userId: 'usr_123', action: 'activate' }
 * );
 */
export class InternalError<
  T extends Record<string, Primitive> = Record<string, Primitive>,
> extends DomainError<Metadata<T>> {
  /** @inheritdoc */
  public readonly code = 'CORE.INTERNAL_ERROR' as const;

  /** @inheritdoc */
  public readonly type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  /**
   * Creates a new InternalError.
   *
   * @param message - Description of the internal error (defaults to 'An unexpected internal error occurred')
   * @param metadata - Optional debug information (primitive values only)
   *
   * @example
   * // Basic usage:
   * throw new InternalError('Something went wrong');
   *
   * @example
   * // With metadata:
   * throw new InternalError(
   *   'Database connection failed',
   *   { host: 'localhost', port: 5432, retries: 3 }
   * );
   */
  constructor(
    message: string = 'An unexpected internal error occurred',
    metadata?: Metadata<T>,
  ) {
    super(message, metadata);
  }
}
