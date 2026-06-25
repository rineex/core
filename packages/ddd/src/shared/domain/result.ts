import type { UseCaseError } from '../use-case.error';

export type { UseCaseError } from '../use-case.error';

/**
 * Successful outcome of an application use case.
 */
export type Ok<T = void> = Readonly<{
  kind: 'ok';
  value: T;
}>;

/**
 * Failed outcome of an application use case.
 */
export type Err<E extends UseCaseError> = Readonly<{
  kind: 'err';
  error: E;
}>;

/**
 * Explicit success/failure for application-layer use cases.
 *
 * Domain entities and value objects may throw on invariant violations.
 * Application services should return Result for expected use-case failures.
 *
 * @template T Success value type. Defaults to void for command use cases.
 * @template E Per-use-case error union.
 */
export type Result<T = void, E extends UseCaseError = UseCaseError> =
  | Err<E>
  | Ok<T>;

function freeze<R extends Result<unknown, UseCaseError>>(result: R): R {
  return Object.freeze(result);
}

function ok(): Ok<void>;
function ok<T>(value: T): Ok<T>;
function ok<T>(value?: T): Ok<T | void> {
  return freeze({ kind: 'ok', value });
}

export const Result = {
  /**
   * Pattern-matches a Result into a single output value.
   */
  match<T, E extends UseCaseError, U>(
    result: Result<T, E>,
    handlers: {
      ok: (value: T) => U;
      err: (error: E) => U;
    },
  ): U {
    return result.kind === 'err'
      ? handlers.err(result.error)
      : handlers.ok(result.value);
  },

  /**
   * Chains another Result-producing operation.
   */
  flatMap<T, E extends UseCaseError, U, F extends UseCaseError = E>(
    result: Result<T, E>,
    fn: (value: T) => Result<U, F>,
  ): Result<U, E | F> {
    return result.kind === 'err' ? result : fn(result.value);
  },

  /**
   * Transforms the error value.
   */
  mapError<T, E extends UseCaseError, F extends UseCaseError>(
    result: Result<T, E>,
    fn: (error: E) => F,
  ): Result<T, F> {
    return result.kind === 'ok' ? result : Result.err(fn(result.error));
  },

  /**
   * Transforms the success value.
   */
  map<T, E extends UseCaseError, U>(
    result: Result<T, E>,
    fn: (value: T) => U,
  ): Result<U, E> {
    return result.kind === 'err' ? result : Result.ok(fn(result.value));
  },

  isErr<T, E extends UseCaseError>(result: Result<T, E>): result is Err<E> {
    return result.kind === 'err';
  },

  isOk<T, E extends UseCaseError>(result: Result<T, E>): result is Ok<T> {
    return result.kind === 'ok';
  },

  err<E extends UseCaseError>(error: E): Err<E> {
    return freeze({ kind: 'err', error });
  },

  ok,
} as const;
