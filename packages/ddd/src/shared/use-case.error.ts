/**
 * Minimum contract for errors returned from application use cases via {@link Result}.
 *
 * Both {@link DomainError} and {@link ApplicationError} satisfy this interface.
 * Domain entities and value objects throw instead of returning Result.
 */
export interface UseCaseError<Code extends string = string> extends Error {
  readonly code: Code;
}
