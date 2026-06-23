import { DomainError, Metadata, Primitive } from '../domain.error';

/**
 * Error thrown when a value violates domain rules or constraints.
 * Use for value violations (e.g., "Email format is invalid", "Age cannot be negative").
 */
export class InvalidValueError<
  T extends Record<string, Primitive> = Record<string, Primitive>,
> extends DomainError<'DOMAIN.INVALID_VALUE', Metadata<T>> {
  public readonly code = 'DOMAIN.INVALID_VALUE' as const;

  constructor(msg = 'invalid value', meta?: Metadata<T>) {
    super(msg, meta);
  }
}
