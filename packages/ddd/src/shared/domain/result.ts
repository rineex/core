/**
 * Represents the outcome of an operation that can either succeed or fail,
 * without relying on exceptions for control flow.
 *
 * This pattern is commonly used in domain and application layers to make
 * success and failure states explicit, predictable, and type-safe.
 *
 * ## Design guarantees
 * - A `Result` is **immutable** once created.
 * - A `Result` is **exactly one of**:
 *   - Success → contains a value
 *   - Failure → contains an error
 * - Accessing the wrong side throws immediately (fail-fast).
 *
 * @typeParam T - Type of the success value
 * @typeParam E - Type of the failure error
 *
 * @example
 * ```ts
 * function parseNumber(input: string): Result<number, string> {
 *   const value = Number(input);
 *
 *   if (Number.isNaN(value)) {
 *     return Result.fail('Invalid number');
 *   }
 *
 *   return Result.ok(value);
 * }
 *
 * const result = parseNumber('42');
 *
 * if (result.isSuccess) {
 *   console.log(result.getValue()); // 42
 * } else {
 *   console.error(result.getError());
 * }
 * ```
 */
export class Result<T, E> {
  /**
   * Indicates whether the result represents a successful outcome.
   *
   * This flag is mutually exclusive with {@link isFailure}.
   */
  public readonly isSuccess: boolean;
  /**
   * Indicates whether the result represents a failed outcome.
   *
   * This flag is mutually exclusive with {@link isSuccess}.
   */
  public readonly isFailure: boolean;

  /**
   * Creates a new {@link Result} instance.
   *
   * This constructor is private to enforce the use of
   * {@link Result.ok} and {@link Result.fail} factory methods,
   * preserving the success/failure invariants.
   *
   * @param _value - Success value (defined only for success results)
   * @param _error - Failure error (defined only for failure results)
   */
  private constructor(
    private readonly _value?: T,
    private readonly _error?: E,
  ) {
    this.isSuccess = _error === undefined;
    this.isFailure = !this.isSuccess;
    Object.freeze(this);
  }

  /**
   * Creates a successful {@link Result}.
   *
   * @param value - Value representing a successful outcome
   * @returns A success {@link Result} containing the provided value
   *
   * @example
   * ```ts
   * return Result.ok(user);
   * ```
   */
  public static ok<T, E>(value: T): Result<T, E> {
    return new Result<T, E>(value);
  }

  /**
   * Creates a failed {@link Result}.
   *
   * @param error - Error describing the failure
   * @returns A failure {@link Result} containing the provided error
   *
   * @example
   * ```ts
   * return Result.fail(new ValidationError('Email is invalid'));
   * ```
   */
  public static fail<T, E>(error: E): Result<T, E> {
    return new Result<T, E>(undefined, error);
  }

  /**
   * Returns the success value.
   *
   * @returns The value associated with a successful result
   *
   * @throws {Error}
   * Thrown if this result represents a failure.
   * This is a fail-fast guard against incorrect usage.
   *
   * @example
   * ```ts
   * if (result.isSuccess) {
   *   const value = result.getValue();
   * }
   * ```
   */
  public getValue(): T {
    if (this.isFailure) {
      throw new Error('Result: Cannot get value of a failure.');
    }

    return this._value as T;
  }

  /**
   * Returns the failure error.
   *
   * @returns The error associated with a failed result
   *
   * @throws {Error}
   * Thrown if this result represents a success.
   * This is a fail-fast guard against incorrect usage.
   *
   * @example
   * ```ts
   * if (result.isFailure) {
   *   const error = result.getError();
   * }
   * ```
   */
  public getError(): E {
    if (this.isSuccess) {
      throw new Error('Result: Cannot get error of a success.');
    }

    return this._error as E;
  }
}
