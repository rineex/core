import { DomainError, Metadata, Primitive } from '../domain.error';

/**
 * Error thrown when an unexpected internal error occurs.
 * Typically used for programming bugs, invalid assumptions, or states that should never happen.
 */
export class InternalError<
  T extends Record<string, Primitive> = Record<string, Primitive>,
> extends DomainError<'CORE.INTERNAL_ERROR', Metadata<T>> {
  public readonly code = 'CORE.INTERNAL_ERROR' as const;

  constructor(
    message: string = 'An unexpected internal error occurred',
    metadata?: Metadata<T>,
  ) {
    super(message, metadata);
  }
}
