import type { UseCaseError } from '../use-case.error';

export type { UseCaseError } from '../use-case.error';

/**
 * Successful outcome of an application use case.
 */
export type Ok<T> = Readonly<{
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
 * Domain entities and value objects throw on invariant violations;
 * application services return Result instead of throwing expected failures.
 *
 * @template T Success value type
 * @template E Per-use-case error union (`ApplicationError`, `DomainError`, etc.)
 */
export type Result<T, E extends UseCaseError> = Ok<T> | Err<E>;

function freeze<R extends Result<unknown, UseCaseError>>(result: R): R {
  return Object.freeze(result);
}

/**
 * Factory and combinators for {@link Result}.
 *
 * @example
 * ```typescript
 * function login(id: string): Result<Session, AuthInvalidCredentialsError> {
 *   if (!valid) return Result.err(new AuthInvalidCredentialsError(id));
 *   return Result.ok(session);
 * }
 *
 * return Result.flatMap(loadUser(id), (user) => issueSession(user));
 * ```
 */
export const Result = {
  ok<T>(value: T): Ok<T> {
    return freeze({ kind: 'ok', value });
  },

  err<E extends UseCaseError>(error: E): Err<E> {
    return freeze({ kind: 'err', error });
  },

  isOk<T, E extends UseCaseError>(result: Result<T, E>): result is Ok<T> {
    return result.kind === 'ok';
  },

  isErr<T, E extends UseCaseError>(result: Result<T, E>): result is Err<E> {
    return result.kind === 'err';
  },

  match<T, E extends UseCaseError, U>(
    result: Result<T, E>,
    handlers: {
      ok: (value: T) => U;
      err: (error: E) => U;
    },
  ): U {
    if (result.kind === 'err') {
      return handlers.err(result.error);
    }

    return handlers.ok(result.value);
  },

  map<T, E extends UseCaseError, U>(
    result: Result<T, E>,
    fn: (value: T) => U,
  ): Result<U, E> {
    if (result.kind === 'err') {
      return result;
    }

    return Result.ok(fn(result.value));
  },

  mapError<T, E extends UseCaseError, F extends UseCaseError>(
    result: Result<T, E>,
    fn: (error: E) => F,
  ): Result<T, F> {
    if (result.kind === 'ok') {
      return result;
    }

    return Result.err(fn(result.error));
  },

  flatMap<T, E extends UseCaseError, U>(
    result: Result<T, E>,
    fn: (value: T) => Result<U, E>,
  ): Result<U, E> {
    if (result.kind === 'err') {
      return result;
    }

    return fn(result.value);
  },
} as const;
