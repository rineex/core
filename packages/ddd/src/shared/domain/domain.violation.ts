/**
 * Base class for Domain violations.
 * Purposely does NOT extend native Error to avoid stack trace overhead in the domain.
 */
export abstract class DomainViolation {
  public abstract readonly code: string;
  public abstract readonly message: string;
  public readonly metadata: Readonly<Record<string, unknown>>;

  constructor(metadata: Record<string, unknown> = {}) {
    this.metadata = Object.freeze(metadata);
  }
}
