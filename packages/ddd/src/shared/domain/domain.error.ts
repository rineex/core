/**
 * Strongly-typed domain error used in Result failures.
 * Does NOT extend native Error on purpose — infrastructure maps to transport later.
 */
export abstract class DomainError {
  public abstract readonly code: DomainErrorCode;
  public readonly message: string;
  public readonly metadata: Readonly<Record<string, boolean | number | string>>;

  protected constructor(params: {
    message: string;
    metadata?: Record<string, boolean | number | string>;
  }) {
    this.message = params.message;
    this.metadata = Object.freeze(params.metadata ?? {});
    Object.freeze(this);
  }
}

export type DomainErrorCode = 'DOMAIN.INVALID_STATE' | 'DOMAIN.INVALID_VALUE';
