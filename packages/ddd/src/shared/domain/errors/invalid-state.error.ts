import {
  DomainError,
  DomainErrorCode,
  DomainErrorType,
  Primitive,
} from '../domain.error';

/**
 * Error thrown when an entity or aggregate is in an invalid state for the requested operation.
 * Use for state violations (e.g., "Cannot checkout empty cart", "Cannot cancel completed order").
 *
 * @example
 * // Prevent invalid state transitions:
 * if (order.status === 'COMPLETED') {
 *   throw new InvalidStateError('Cannot cancel a completed order');
 * }
 *
 * @example
 * // With context:
 * if (!cart.hasItems()) {
 *   throw new InvalidStateError('Cannot checkout empty cart');
 * }
 */
export class InvalidStateError extends DomainError<Record<string, Primitive>> {
  public code: DomainErrorCode = 'DOMAIN.INVALID_STATE';
  public type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  constructor(message = 'invalid state') {
    super(message, {});
  }
}
