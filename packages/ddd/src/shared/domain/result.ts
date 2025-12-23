/**
 * Result pattern to handle business logic flow without throwing exceptions.
 * @template T Success value type
 * @template E Error violation type
 */
export class Result<T, E> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;

  private constructor(
    private readonly _value?: T,
    private readonly _error?: E,
  ) {
    this.isSuccess = _error === undefined;
    this.isFailure = !this.isSuccess;
    Object.freeze(this);
  }

  public static ok<T, E>(value: T): Result<T, E> {
    return new Result<T, E>(value);
  }

  public static fail<T, E>(error: E): Result<T, E> {
    return new Result<T, E>(undefined, error);
  }

  public getValue(): T {
    if (this.isFailure)
      throw new Error('Result: Cannot get value of a failure.');
    return this._value as T;
  }

  public getError(): E {
    if (this.isSuccess)
      throw new Error('Result: Cannot get error of a success.');
    return this._error as E;
  }
}
