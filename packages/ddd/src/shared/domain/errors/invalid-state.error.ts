import { DomainError, Metadata, Primitive } from '../domain.error';

/**
 * Error thrown when an entity or aggregate is in an invalid state for the requested operation.
 * Use for state violations (e.g., "Cannot checkout empty cart", "Cannot cancel completed order").
 */
export class InvalidStateError extends DomainError<
  'DOMAIN.INVALID_STATE',
  Record<string, Primitive>
> {
  public readonly code = 'DOMAIN.INVALID_STATE' as const;

  constructor(message = 'invalid state') {
    super(message, {});
  }
}
