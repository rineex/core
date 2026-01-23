import { DomainError } from './domain.error';

/**
 * Represents the result of an operation, which can be either a success or a failure.
 *
 * This is a functional programming pattern that helps avoid throwing exceptions
 * and makes error handling explicit in the type system. It's commonly used in
 * Domain-Driven Design (DDD) to represent domain operation outcomes.
 *
 * @template T The type of a successful result.
 * @template E The type of the error in case of failure (defaults to DomainError).
 *
 * @example
 * ```typescript
 * // Creating a successful result
 * const success = Result.ok({ id: 1, name: 'John' });
 * if (success.isSuccess) {
 *   const user = success.getValue(); // { id: 1, name: 'John' }
 * }
 *
 * // Creating a failed result
 * const failure = Result.fail(new InvalidUserError('User not found'));
 * if (failure.isFailure) {
 *   const error = failure.getError(); // InvalidUserError instance
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Using in a domain service
 * function createUser(name: string): Result<User, DomainError> {
 *   if (!name || name.trim().length === 0) {
 *     return Result.fail(new InvalidValueError('Name cannot be empty'));
 *   }
 *
 *   const user = new User(name);
 *   return Result.ok(user);
 * }
 *
 * const result = createUser('John Doe');
 * if (result.isSuccess) {
 *   console.log('User created:', result.getValue());
 * } else {
 *   console.error('Failed:', result.getError()?.message);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Chaining operations
 * function validateEmail(email: string): Result<string, DomainError> {
 *   if (!email.includes('@')) {
 *     return Result.fail(new InvalidValueError('Invalid email format'));
 *   }
 *   return Result.ok(email);
 * }
 *
 * function createAccount(email: string): Result<Account, DomainError> {
 *   const emailResult = validateEmail(email);
 *   if (emailResult.isFailure) {
 *     return emailResult; // Forward the error
 *   }
 *
 *   const account = new Account(emailResult.getValue()!);
 *   return Result.ok(account);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Working with async operations
 * async function fetchUser(id: number): Promise<Result<User, DomainError>> {
 *   try {
 *     const user = await userRepository.findById(id);
 *     if (!user) {
 *       return Result.fail(new NotFoundError(`User ${id} not found`));
 *     }
 *     return Result.ok(user);
 *   } catch (error) {
 *     return Result.fail(new SystemError('Database connection failed'));
 *   }
 * }
 *
 * const result = await fetchUser(123);
 * if (result.isSuccess) {
 *   // Handle success
 * } else {
 *   // Handle failure
 * }
 * ```
 */
export class Result<T, E> {
  /**
   * Indicates if the result is a failure.
   *
   * @example
   * ```typescript
   * const result = Result.fail(new Error('Something went wrong'));
   * if (result.isFailure) {
   *   // Handle error case
   *   console.error(result.getError());
   * }
   * ```
   */
  public readonly isFailure: boolean;

  /**
   * Indicates if the result is a success.
   *
   * @example
   * ```typescript
   * const result = Result.ok(42);
   * if (result.isSuccess) {
   *   // Handle success case
   *   const value = result.getValue(); // 42
   * }
   * ```
   */
  public readonly isSuccess: boolean;

  /**
   * The error, if any.
   * @private
   */
  private readonly _error?: E;

  /**
   * The value, if any.
   * @private
   */
  private readonly _value?: T;

  /**
   * Private constructor to enforce the use of static methods.
   * @param params.value The value on success.
   * @param params.error The error on failure.
   * @private
   */
  private constructor(params: { value?: T; error?: E }) {
    const hasError = params.error !== undefined;
    this.isFailure = hasError;
    this.isSuccess = !hasError;

    this._value = params.value;
    this._error = params.error;
    Object.freeze(this);
  }

  /**
   * Creates a failed result.
   *
   * @template T The type of a successful result (never for failure).
   * @template E The type of the error (defaults to DomainError).
   * @param error The error object.
   * @returns {Result<T, E>} A failed Result instance.
   *
   * @example
   * ```typescript
   * // With DomainError
   * class InvalidValueError extends DomainError {
   *   public readonly code = 'DOMAIN.INVALID_VALUE' as const;
   *   constructor(message: string) {
   *     super({ message });
   *   }
   * }
   *
   * const result = Result.fail(new InvalidValueError('Value must be positive'));
   * // result.isFailure === true
   * // result.getError() === InvalidValueError instance
   * ```
   *
   * @example
   * ```typescript
   * // With custom error type
   * interface ValidationError {
   *   field: string;
   *   message: string;
   * }
   *
   * const result = Result.fail<never, ValidationError>({
   *   field: 'email',
   *   message: 'Invalid email format'
   * });
   * ```
   *
   * @example
   * ```typescript
   * // In a validation function
   * function validateAge(age: number): Result<number, DomainError> {
   *   if (age < 0) {
   *     return Result.fail(new InvalidValueError('Age cannot be negative'));
   *   }
   *   if (age > 150) {
   *     return Result.fail(new InvalidValueError('Age seems unrealistic'));
   *   }
   *   return Result.ok(age);
   * }
   * ```
   */
  public static fail<T = never, E = DomainError>(error: E): Result<T, E> {
    return new Result({ error });
  }

  /**
   * Creates a successful result.
   *
   * @template T The type of the successful result.
   * @template E The type of the error (never for success).
   * @param value The success value.
   * @returns {Result<T, E>} A successful Result instance.
   *
   * @example
   * ```typescript
   * // With primitive value
   * const result = Result.ok(42);
   * // result.isSuccess === true
   * // result.getValue() === 42
   * ```
   *
   * @example
   * ```typescript
   * // With object
   * const user = { id: 1, name: 'John', email: 'john@example.com' };
   * const result = Result.ok(user);
   * if (result.isSuccess) {
   *   const savedUser = result.getValue(); // { id: 1, name: 'John', ... }
   * }
   * ```
   *
   * @example
   * ```typescript
   * // With domain entity
   * class User {
   *   constructor(public readonly id: number, public readonly name: string) {}
   * }
   *
   * function createUser(name: string): Result<User, DomainError> {
   *   const user = new User(Date.now(), name);
   *   return Result.ok(user);
   * }
   *
   * const result = createUser('Alice');
   * if (result.isSuccess) {
   *   console.log(`Created user: ${result.getValue()?.name}`);
   * }
   * ```
   *
   * @example
   * ```typescript
   * // With void/undefined (for operations that don't return a value)
   * function deleteUser(id: number): Result<void, DomainError> {
   *   // ... deletion logic ...
   *   return Result.ok(undefined);
   * }
   *
   * const result = deleteUser(123);
   * if (result.isSuccess) {
   *   console.log('User deleted successfully');
   * }
   * ```
   */
  public static ok<T, E = never>(value: T): Result<T, E> {
    return new Result({ value });
  }

  /**
   * Returns the error if present, otherwise undefined.
   *
   * **Note:** Always check `isFailure` before calling this method to ensure
   * the result is actually a failure. This method will return `undefined` for
   * successful results.
   *
   * @returns {E | undefined} The error or undefined if successful.
   *
   * @example
   * ```typescript
   * const result = Result.fail(new InvalidValueError('Invalid input'));
   *
   * if (result.isFailure) {
   *   const error = result.getError();
   *   if (error) {
   *     console.error(`Error code: ${error.code}, Message: ${error.message}`);
   *   }
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Safe error handling pattern
   * function handleResult<T>(result: Result<T, DomainError>): void {
   *   if (result.isFailure) {
   *     const error = result.getError();
   *     if (error) {
   *       // Log error with metadata
   *       console.error({
   *         code: error.code,
   *         message: error.message,
   *         metadata: error.metadata
   *       });
   *     }
   *   }
   * }
   * ```
   */
  public getError(): E | undefined {
    return this._error;
  }

  /**
   * Returns the value if present, otherwise undefined.
   *
   * **Note:** Always check `isSuccess` before calling this method to ensure
   * the result is actually a success. This method will return `undefined` for
   * failed results.
   *
   * @returns {T | undefined} The value or undefined if failed.
   *
   * @example
   * ```typescript
   * const result = Result.ok({ id: 1, name: 'John' });
   *
   * if (result.isSuccess) {
   *   const user = result.getValue();
   *   if (user) {
   *     console.log(`User: ${user.name} (ID: ${user.id})`);
   *   }
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Type-safe value extraction
   * function processUser(result: Result<User, DomainError>): void {
   *   if (result.isSuccess) {
   *     const user = result.getValue();
   *     // TypeScript knows user is User | undefined here
   *     if (user) {
   *       // Process the user
   *       userRepository.save(user);
   *     }
   *   }
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Using non-null assertion (use with caution)
   * const result = Result.ok(42);
   * if (result.isSuccess) {
   *   const value = result.getValue()!; // Safe because we checked isSuccess
   *   console.log(value * 2); // 84
   * }
   * ```
   */
  public getValue(): T | undefined {
    return this._value;
  }

  /**
   * Type guard for failure.
   */
  public isFailureResult(): this is Result<never, E> {
    return this.isFailure;
  }

  /**
   * Type guard for success.
   */
  public isSuccessResult(): this is Result<T, never> {
    return this.isSuccess;
  }
}
