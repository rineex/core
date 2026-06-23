import { EmptyObject } from 'type-fest';

import type { UseCaseError } from '../use-case.error';

import type { CoreDomainErrorCode } from './domain-error.registry';

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
 * Union of error codes declared in {@link CoreDomainErrorRegistry}.
 *
 * @deprecated Prefer `CoreDomainErrorCode` from the registry module.
 */
export type DomainErrorCode = CoreDomainErrorCode;

/**
 * Extracts the namespace part from a domain error code.
 *
 * @typeParam Code - Full error code (e.g. 'USER.NOT_FOUND')
 */
export type ExtractNamespace<Code extends string> =
  Code extends `${infer N}.${string}` ? N : never;

/**
 * Extracts the error name part from a domain error code.
 *
 * @typeParam Code - Full error code (e.g. 'USER.NOT_FOUND')
 */
export type ExtractErrorName<Code extends string> =
  Code extends `${string}.${infer E}` ? E : never;

/**
 * Base class for all domain errors in a Domain-Driven Design architecture.
 *
 * Domain errors represent violations of business rules and domain invariants.
 * Extends native Error for proper stack traces, serialization, and catch semantics.
 *
 * @typeParam Code - Machine-readable error code (e.g. 'USER.NOT_FOUND')
 * @typeParam Meta - Type of metadata associated with this error
 *
 * @example
 * // 1. Declare a registry in your bounded context:
 * export const UserErrorRegistry = {
 *   USER: ['NOT_FOUND', 'INVALID_EMAIL'],
 * } as const;
 * export type UserDomainErrorCode = InferErrorCodes<typeof UserErrorRegistry>;
 *
 * @example
 * // 2. Create a concrete domain error:
 * class UserNotFoundError extends DomainError<'USER.NOT_FOUND', { userId: string }> {
 *   public readonly code = 'USER.NOT_FOUND' as const;
 *
 *   constructor(userId: string) {
 *     super(`User with ID '${userId}' not found`, { userId });
 *   }
 * }
 *
 * @abstract
 */
export abstract class DomainError<
  Code extends string = string,
  Meta extends Record<string, Primitive> = EmptyObject,
>
  extends Error
  implements UseCaseError<Code>
{
  /**
   * Machine-readable error code in format: NAMESPACE.ERROR_NAME
   *
   * @example
   * public readonly code = 'USER.NOT_FOUND' as const;
   */
  public abstract readonly code: Code;

  /**
   * Immutable structured context providing additional information about the error.
   *
   * @readonly
   */
  public readonly metadata: Readonly<Meta>;

  /**
   * Error name portion of the code (e.g. 'NOT_FOUND' from 'USER.NOT_FOUND').
   */
  public get errorName(): ExtractErrorName<Code> {
    return this.code.split('.')[1] as ExtractErrorName<Code>;
  }

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
   */
  constructor(message: string, metadata?: Meta) {
    super(message);
    this.name = new.target.name;
    this.metadata = Object.freeze(metadata ?? {}) as Readonly<Meta>;

    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Type guard to check if a value is a DomainError instance.
   */
  public static isInstance(
    error: unknown,
  ): error is DomainError<string, Record<string, Primitive>> {
    return error instanceof DomainError;
  }

  /**
   * Serializes the error to a plain object for debugging, logging, or transport.
   */
  public toObject() {
    return {
      code: this.code,
      message: this.message,
      metadata: this.metadata,
    };
  }

  /**
   * Returns a string representation of the error.
   * Format: [CODE] MESSAGE
   */
  public override toString(): string {
    return `[${this.code}] ${this.message}`;
  }
}
