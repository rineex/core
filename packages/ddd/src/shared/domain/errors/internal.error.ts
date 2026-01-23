/* eslint-disable @typescript-eslint/class-literal-property-style */

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
 * @example
 * // Catch a programming error:
 * try {
 *   complexBusinessLogic();
 * } catch (error) {
 *   throw new InternalError({
 *     message: 'Unexpected error in complexBusinessLogic',
 *     metadata: { originalError: error.message, timestamp: Date.now() }
 *   });
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
 *     throw new InternalError({
 *       message: `Unhandled status: ${status}`,
 *       metadata: { status }
 *     });
 * }
 */
export class InternalError<T = Record<string, Primitive>> extends DomainError<
  Metadata<T>
> {
  /** @inheritdoc */
  public readonly code = 'CORE.INTERNAL_ERROR' as const;

  /** @inheritdoc */
  public readonly type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  /**
   * Creates a new InternalError.
   *
   * @param message - Description of the internal error
   * @param metadata - Optional debug information
   */
  constructor(
    message: string = 'An unexpected internal error occurred',
    metadata?: Metadata<T>,
  ) {
    super(message, metadata);
  }
}
