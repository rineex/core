import { DomainError, Metadata, Primitive } from '../domain.error';

/**
 * Error thrown when an operation times out.
 */
export class TimeoutError<
  T extends Record<string, Primitive> = Record<string, Primitive>,
> extends DomainError<'SYSTEM.TIMEOUT', Metadata<T>> {
  public readonly code = 'SYSTEM.TIMEOUT' as const;
}
