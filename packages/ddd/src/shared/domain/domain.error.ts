import { EmptyObject } from 'type-fest';

/**
 * Primitive types allowed in domain error metadata.
 * Used to ensure metadata is serializable and does not contain complex objects.
 */
export type Primitive = boolean | number | string | null | undefined;

/**
 * Type for metadata objects. Ensures only primitive values are allowed.
 * Falls back to EmptyObject when T is not a record of primitives.
 *
 * @typeParam T - Expected metadata shape
 */
export type Metadata<T = EmptyObject> =
  T extends Record<string, Primitive> ? T : EmptyObject;

/**
 * Categories of domain errors based on the nature of the violation.
 *
 * @typedef {'DOMAIN.INVALID_STATE' | 'DOMAIN.INVALID_VALUE'} DomainErrorType
 *
 * @example
 * // DomainErrorType usage:
 * const errorType: DomainErrorType = 'DOMAIN.INVALID_STATE';
 */
export type DomainErrorType = 'DOMAIN.INVALID_STATE' | 'DOMAIN.INVALID_VALUE';

// ============ TYPE UTILITIES ============
/** Extracts the union of all value types from an object type. */
export type ValueOf<T> = T[keyof T];
/** Converts a union type to an intersection type. */
export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

/**
 * Interface for declaring domain error namespaces via declaration merging.
 * Projects extend this interface to add their own namespaces and error codes.
 *
 * @example
 * // In your project's type definition file (.d.ts):
 * declare module '@your-org/domain-errors' {
 *   interface DomainErrorNamespaces {
 *     USER: ['NOT_FOUND', 'INVALID_EMAIL', 'SUSPENDED'];
 *     ORDER: ['NOT_FOUND', 'INVALID_STATUS', 'OUT_OF_STOCK'];
 *     // Override default namespace (optional):
 *     CORE: ['INTERNAL_ERROR', 'VALIDATION_FAILED', 'CONFIGURATION_ERROR'];
 *   }
 * }
 *
 * @example
 * // This enables type-safe error codes:
 * const code: DomainErrorCode = 'USER.NOT_FOUND'; // ✅ Valid
 * const code: DomainErrorCode = 'USER.INVALID';   // ❌ TypeScript error
 */
export interface DomainErrorNamespaces {
  // Built-in core namespaces (available in all projects)
  DOMAIN: ['INVALID_VALUE', 'INVALID_STATE'];
  CORE: [
    'INTERNAL_ERROR',
    'VALIDATION_FAILED',
    'CONFIGURATION_ERROR',
    'NOT_IMPLEMENTED',
  ];
  SYSTEM: ['UNEXPECTED', 'TIMEOUT', 'NETWORK_ERROR', 'DEPENDENCY_ERROR'];
}

// ============ INFER TYPES FROM REGISTRY ============
type Namespace = keyof DomainErrorNamespaces;
type ErrorName<N extends Namespace> = DomainErrorNamespaces[N][number];

/**
 * Union type of all valid domain error codes derived from registered namespaces.
 * Automatically updates when projects extend DomainErrorNamespaces.
 *
 * @example
 * // After extending DomainErrorNamespaces with USER namespace:
 * type ErrorCode = DomainErrorCode;
 * // Becomes: 'CORE.INTERNAL_ERROR' | 'CORE.VALIDATION_FAILED' |
 * //           'USER.NOT_FOUND' | 'USER.INVALID_EMAIL' | ...
 */
export type DomainErrorCode = {
  [N in Namespace]: `${Uppercase<string & N>}.${Uppercase<ErrorName<N>>}`;
}[Namespace];

/**
 * Extracts the namespace part from a domain error code.
 *
 * @typeParam Code - Full error code (e.g. 'USER.NOT_FOUND')
 */
export type ExtractNamespace<Code extends DomainErrorCode> =
  Code extends `${infer N}.${string}` ? N : never;

/**
 * Extracts the error name part from a domain error code.
 *
 * @typeParam Code - Full error code (e.g. 'USER.NOT_FOUND')
 */
export type ExtractErrorName<Code extends DomainErrorCode> =
  Code extends `${string}.${infer E}` ? E : never;

/**
 * Base class for all domain errors in a Domain-Driven Design architecture.
 *
 * Domain errors represent violations of business rules and domain invariants.
 * They are pure value objects without infrastructure concerns like IDs or timestamps.
 *
 * @typeParam Code - The specific error code from DomainErrorCode union
 * @typeParam Meta - Type of metadata associated with this error
 *
 * @example
 * // 1. First, declare your namespaces:
 * declare module '@your-org/domain-errors' {
 *   interface DomainErrorNamespaces {
 *     USER: ['NOT_FOUND', 'INVALID_EMAIL'];
 *   }
 * }
 *
 * @example
 * // 2. Create a concrete domain error:
 * class UserNotFoundError extends DomainError<'USER.NOT_FOUND', { userId: string }> {
 *   public readonly code = 'USER.NOT_FOUND' as const;
 *   public readonly type: DomainErrorType = 'DOMAIN.INVALID_VALUE';
 *
 *   constructor(userId: string) {
 *     super(`User with ID '${userId}' not found`, { userId });
 *   }
 * }
 *
 * @example
 * // 3. Usage in domain services:
 * class UserService {
 *   async activateUser(userId: string): Promise<Result<User, DomainError>> {
 *     const user = await this.repository.findById(userId);
 *
 *     if (!user) {
 *       return Result.failure(new UserNotFoundError(userId));
 *     }
 *
 *     if (user.isSuspended) {
 *       return Result.failure(new UserSuspendedError(userId));
 *     }
 *
 *     // Business logic...
 *   }
 * }
 *
 * @abstract
 */
export abstract class DomainError<
  Meta extends Record<string, Primitive> = EmptyObject,
  Code extends DomainErrorCode = DomainErrorCode,
> {
  /**
   * Machine-readable error code in format: NAMESPACE.ERROR_NAME
   *
   * @remarks
   * - Must be uppercase (e.g., 'USER.NOT_FOUND')
   * - Namespace must be declared in DomainErrorNamespaces
   * - Error name must be in the namespace's array
   *
   * @example
   * public readonly code = 'USER.NOT_FOUND' as const;
   */
  public abstract readonly code: Code;
  /**
   * Human-readable error message describing the domain rule violation.
   * Should be meaningful to developers and potentially end-users.
   *
   * @remarks
   * - Avoid technical implementation details
   * - Focus on the business rule that was violated
   * - Can include values from metadata for context
   *
   * @example
   * // Good: "Order amount $150 exceeds maximum limit of $100"
   * // Bad: "Amount validation failed: 150 > 100"
   */
  public readonly message: string;

  /**
   * Immutable structured context providing additional information about the error.
   * Useful for debugging, logging, and creating detailed error messages.
   *
   * @remarks
   * - Values must be primitive types (string, number, boolean, etc.)
   * - Object is frozen to prevent mutation
   * - Type-safe based on the error code
   *
   * @example
   * // For UserNotFoundError:
   * { userId: 'usr_123', attemptedAction: 'activate' }
   *
   * @readonly
   */
  public readonly metadata: Readonly<Meta>;

  /**
   * Category of domain error indicating the nature of violation.
   *
   * @remarks
   * Use 'DOMAIN.INVALID_STATE' for state violations (e.g., "Cannot checkout empty cart")
   * Use 'DOMAIN.INVALID_VALUE' for value violations (e.g., "Email format is invalid")
   *
   * @example
   * public readonly type: DomainErrorType = 'DOMAIN.INVALID_VALUE';
   */
  public abstract readonly type: DomainErrorType;

  /**
   * Error name portion of the code (e.g. 'NOT_FOUND' from 'USER.NOT_FOUND').
   */
  public get errorName(): ExtractErrorName<Code> {
    return this.code.split('.')[1] as ExtractErrorName<Code>;
  }

  // ============ COMPUTED PROPERTIES ============
  /**
   * Namespace portion of the code (e.g. 'USER' from 'USER.NOT_FOUND').
   */
  public get namespace(): ExtractNamespace<Code> {
    return this.code.split('.')[0] as ExtractNamespace<Code>;
  }

  /**
   * Creates a new DomainError instance.
   *
   * @param message - Human-readable description of the domain rule violation
   * @param metadata - Optional structured context (primitive values only)
   *
   * @example
   * constructor(userId: string) {
   *   super(`User with ID '${userId}' not found`, { userId });
   * }
   *
   * @example
   * constructor(amount: number, maxLimit: number) {
   *   super(
   *     `Order amount $${amount} exceeds maximum limit of $${maxLimit}`,
   *     { amount, maxLimit }
   *   );
   * }
   */
  protected constructor(
    message: string,
    ...args: keyof Meta extends never
      ? [] | [metadata?: Meta]
      : [metadata: Meta]
  ) {
    this.message = message;
    this.metadata = Object.freeze(args[0] ?? {}) as Readonly<Meta>;
  }

  /**
   * Type guard to check if a value is a DomainError instance.
   *
   * @param error - Value to check (typically from catch block or unknown source)
   * @returns True if error is a DomainError instance, false otherwise
   *
   * @example
   * try {
   *   await userService.activate(userId);
   * } catch (error) {
   *   if (DomainError.isInstance(error)) {
   *     // error is narrowed to DomainError
   *     console.log(error.code, error.message);
   *   } else {
   *     throw error;
   *   }
   * }
   *
   * @example
   * const result = await userService.findById(id);
   * if (Result.isFailure(result)) {
   *   const err = result.error;
   *   if (DomainError.isInstance(err)) {
   *     return Result.failure(err);
   *   }
   * }
   */
  public static isInstance(
    error: unknown,
  ): error is DomainError<Record<string, Primitive>, DomainErrorCode> {
    return error instanceof DomainError;
  }

  /**
   * Serializes the error to a plain object for debugging, logging, or transport.
   * Does not include infrastructure concerns like stack traces or timestamps.
   *
   * @returns Plain object with error details
   *
   * @example
   * const error = new UserNotFoundError('usr_123');
   * const json = error.toJSON();
   * // Result:
   * // {
   * //   code: 'USER.NOT_FOUND',
   * //   message: "User with ID 'usr_123' not found",
   * //   type: 'DOMAIN.INVALID_VALUE',
   * //   metadata: { userId: 'usr_123' }
   * // }
   */
  public toObject() {
    return {
      metadata: this.metadata,
      message: this.message,
      code: this.code,
      type: this.type,
    };
  }

  /**
   * Returns a string representation of the error.
   * Format: [CODE] MESSAGE
   *
   * @returns Human-readable string representation
   *
   * @example
   * const error = new UserNotFoundError('usr_123');
   * console.log(error.toString());
   * // Output: [USER.NOT_FOUND] User with ID 'usr_123' not found
   *
   * @override
   */
  public toString(): string {
    return `[${this.code}] ${this.message}`;
  }
}
