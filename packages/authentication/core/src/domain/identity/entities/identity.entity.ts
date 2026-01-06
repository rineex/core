import { CreateEntityProps, Entity } from '@rineex/ddd';

import { IdentityId } from '../value-objects/identity-id.vo';

/**
 * Properties owned by the Identity entity.
 *
 * IMPORTANT:
 * - This is NOT a user profile
 * - This is NOT authorization data
 * - This represents a stable authentication identity
 *
 * Examples:
 * - Email-based identity
 * - External IdP subject
 * - Service or machine identity
 */
export interface IdentityCreateProps extends CreateEntityProps<IdentityId> {
  readonly isActive: boolean;
}

/**
 * Identity entity.
 *
 * Represents "who is authenticating" in the system.
 *
 * This entity is intentionally minimal and stable.
 * Any additional concerns (profile, roles, permissions)
 * MUST live in other bounded contexts.
 */
export class Identity extends Entity<IdentityId> {
  // We keep the state private to the class
  private _isActive: boolean;

  /**
   * Private constructor forces usage of factory methods.
   */
  private constructor({ isActive, ...props }: IdentityCreateProps) {
    super(props);
    this._isActive = isActive;
  }

  /**
   * Factory method to create a new identity.
   */
  static create(id: IdentityId, isActive: boolean = true): Identity {
    return new Identity({
      isActive,
      id,
    });
  }

  /**
   * Getter for the active state
   */
  public get isActive(): boolean {
    return this._isActive;
  }

  /**
   * Disables this identity.
   */
  public disable(): void {
    if (!this._isActive) return;

    this.mutate(draft => {
      draft._isActive = false;
    });
  }

  /**
   * Enables this identity.
   */
  public enable(): void {
    if (this._isActive) return;

    this.mutate(draft => {
      draft._isActive = true;
    });
  }

  /**
   * Domain invariant validation.
   */
  public validate(): void {
    if (this.id == null) {
      throw new Error('Identity must have a valid IdentityId');
    }
    if (typeof this._isActive !== 'boolean') {
      throw new Error('Identity.isActive must be a boolean');
    }
  }

  /**
   * Serialization to plain object.
   */
  public toObject(): Record<string, unknown> {
    return {
      createdAt: this.createdAt.toISOString(),
      isActive: this._isActive,
      id: this.id.toString(),
    };
  }

  /**
   * Creates a snapshot of mutable state.
   * Identity fields MUST NOT be included.
   *
   * Used internally for rollback.
   */
  protected snapshot(): Record<string, unknown> {
    return {
      isActive: this._isActive,
    };
  }

  /**
   * Restores mutable state from a snapshot.
   * Identity fields MUST NOT be modified.
   *
   * @param snapshot - Previously captured state.
   */
  protected restore(snapshot: Record<string, unknown>): void {
    this._isActive = snapshot.isActive as boolean;
  }
}
