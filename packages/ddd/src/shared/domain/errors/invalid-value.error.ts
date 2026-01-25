import {
  DomainError,
  DomainErrorCode,
  DomainErrorType,
  Metadata,
  Primitive,
} from '../domain.error';

/**
 * Error thrown when a value violates domain rules or constraints.
 * Use for value violations (e.g., "Email format is invalid", "Age cannot be negative").
 *
 * @template T - Type of metadata object (must extend Record<string, Primitive>)
 *
 * @example
 * // Basic usage:
 * if (age < 0) {
 *   throw new InvalidValueError('Age cannot be negative');
 * }
 *
 * @example
 * // With metadata:
 * if (!isValidEmail(email)) {
 *   throw new InvalidValueError(
 *     'Invalid email format',
 *     { email, pattern: '^[^@]+@[^@]+\\.[^@]+$' }
 *   );
 * }
 *
 * @example
 * // With custom metadata type:
 * type ValidationMetadata = { field: string; value: unknown; reason: string };
 * throw new InvalidValueError<ValidationMetadata>(
 *   'Validation failed',
 *   { field: 'email', value: email, reason: 'Invalid format' }
 * );
 */
export class InvalidValueError<
  T extends Record<string, Primitive> = Record<string, Primitive>,
> extends DomainError<Metadata<T>> {
  public code: DomainErrorCode = 'DOMAIN.INVALID_VALUE';
  public type: DomainErrorType = 'DOMAIN.INVALID_VALUE';

  constructor(msg = 'invalid value', meta?: Metadata<T>) {
    super(msg, meta);
  }
}
