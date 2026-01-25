import {
  DomainError,
  DomainErrorType,
  Metadata,
  Primitive,
} from '../domain.error';

/**
 * Error thrown when an operation times out.
 * Use for operations that exceed their allowed execution time.
 *
 * @template T - Type of metadata object (must extend Record<string, Primitive>)
 *
 * @example
 * // Operation timeout:
 * const timeout = setTimeout(() => {
 *   throw new TimeoutError(
 *     'User registration timed out'
 *   );
 * }, 5000);
 *
 * @example
 * // With Promise.race:
 * type Props = { url: string; timeoutMs: number };
 * async function fetchWithTimeout(url: string, timeoutMs: number) {
 *   const timeoutPromise = new Promise<never>((_, reject) => {
 *     setTimeout(() => {
 *       reject(new TimeoutError<Props>(
 *         `Request to ${url} timed out`,
 *         { url, timeoutMs }
 *       ));
 *     }, timeoutMs);
 *   });
 *
 *   return await Promise.race([fetch(url), timeoutPromise]);
 * }
 *
 * @example
 * // With custom metadata:
 * throw new TimeoutError(
 *   'Database query timed out',
 *   { query: 'SELECT * FROM users', timeout: 5000, retries: 3 }
 * );
 */
export class TimeoutError<
  T extends Record<string, Primitive> = Record<string, Primitive>,
> extends DomainError<Metadata<T>> {
  /** @inheritdoc */
  public readonly code = 'SYSTEM.TIMEOUT' as const;

  /** @inheritdoc */
  public readonly type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  /**
   * Creates a new TimeoutError.
   *
   * @param message - Description of the timeout
   * @param metadata - Optional timeout context
   */
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(message: string, metadata?: Metadata<T>) {
    super(message, metadata);
  }
}
