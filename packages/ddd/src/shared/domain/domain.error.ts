export type DomainErrorType = 'DOMAIN.INVALID_STATE' | 'DOMAIN.INVALID_VALUE';
/**
 * Strongly-typed domain error used in Result failures.
 * Does NOT extend native Error on purpose — infrastructure maps to transport later.
 */
export abstract class DomainError {
  /** Stable, machine-readable error code */
  public abstract readonly code: string;
  public abstract message: string;
  public readonly metadata: Readonly<Record<string, boolean | number | string>>;
  public abstract readonly type: DomainErrorType;

  protected constructor(payload?: Record<string, boolean | number | string>) {
    this.metadata = Object.freeze(payload ?? {});
    Object.freeze(this);
  }
}
